import { Router, type Request } from "express";
import crypto from "crypto";
import prisma from "../prisma.js";

const router = Router();

/**
 * Utilidad: devuelve el primer valor si viene como array (querystring).
 */
function first<T>(v: T | T[] | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Valida firma de Mercado Pago si tenés MP_WEBHOOK_SECRET configurado.
 * Si NO tenés el secret, no valida (para no bloquearte en pruebas).
 *
 * MP manda headers:
 * - x-signature: "ts=...,v1=..."
 * - x-request-id: "..."
 *
 * Firma: HMAC SHA256(secret, `id:${id};request-id:${reqId};ts:${ts};`)
 */
function verifyMercadoPagoSignature(req: Request, id: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secret => no validamos (modo dev)

  const xSignature = req.header("x-signature");
  const xRequestId = req.header("x-request-id");
  if (!xSignature || !xRequestId) return false;

  // parse: ts=XXXX,v1=HASH
  const parts = xSignature.split(",").map((p) => p.trim());
  let ts: string | undefined;
  let v1: string | undefined;

  for (const p of parts) {
    const [k, val] = p.split("=").map((s) => s.trim());
    if (k === "ts") ts = val;
    if (k === "v1") v1 = val;
  }

  if (!ts || !v1) return false;

  const manifest = `id:${id};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  // comparación segura
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);

}

router.post("/mercadopago", async (req, res) => {
  try {
    // MP puede mandar el id como:
    // - ?data.id=123&type=payment
    // - ?id=123&topic=payment
    // - body: { data: { id: "123" }, type: "payment" }
    const q = req.query as Record<string, any>;
    const body: any = req.body ?? {};

    const type = (first(q.type) ?? first(q.topic) ?? body.type ?? body.topic) as
      | string
      | undefined;

    const notificationId =
      first(q["data.id"]) ??
      first(q.id) ??
      body?.data?.id ??
      body?.id ??
      null;

    if (!notificationId) {
      // Nada que procesar
      return res.sendStatus(200);
    }

    const notifIdStr = String(notificationId);

    // Firma (si tenés secret configurado)
    if (!verifyMercadoPagoSignature(req, notifIdStr)) {
      return res.status(401).json({ error: "Firma inválida" });
    }

    // Si llega merchant_order, primero buscamos un paymentId real
    let paymentId = notifIdStr;

    if (type === "merchant_order") {
      const moResp = await fetch(
        `https://api.mercadopago.com/merchant_orders/${notifIdStr}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      );

      if (!moResp.ok) {
        console.log("MP merchant_order fetch failed", moResp.status);
        return res.sendStatus(200);
      }

      const mo = await moResp.json();

      // Preferimos uno approved, sino el primero
      const approved =
        (mo?.payments ?? []).find((p: any) => p?.status === "approved") ??
        (mo?.payments ?? [])[0];

      if (!approved?.id) return res.sendStatus(200);
      paymentId = String(approved.id);
    } else {
      // si type viene vacío, igual intentamos tratarlo como payment
      // y también aceptamos type=payment
      if (type && type !== "payment") {
        // otros eventos que no manejamos
        return res.sendStatus(200);
      }
    }

    // Consultamos el pago real
    const paymentResp = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    if (!paymentResp.ok) {
      console.log("MP payment fetch failed", paymentResp.status);
      return res.sendStatus(200);
    }

    const payment = await paymentResp.json();

    const status = String(payment?.status ?? "");
    const externalRef = payment?.external_reference ?? payment?.metadata?.orderId;

    const orderId = Number(externalRef);
    if (!orderId || Number.isNaN(orderId)) {
      console.log("No pude obtener orderId desde external_reference/metadata", {
        externalRef,
        paymentId,
        status,
      });
      return res.sendStatus(200);
    }

    // Mapeo de estados MP -> OrderStatus (tu schema)
    const targetStatus =
      status === "approved"
        ? "PAID"
        : ["cancelled", "rejected", "charged_back", "refunded"].includes(status)
          ? "CANCELLED"
          : null;

    if (!targetStatus) {
      // pending / in_process / etc => no tocamos la orden
      return res.sendStatus(200);
    }

    await prisma.$transaction(async (tx) => {
      const ord = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!ord) return;

      // idempotencia
      if (ord.status === targetStatus) return;

      if (targetStatus === "PAID") {
        // Solo marcamos PAID si estaba pendiente (o no estaba pagada)
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });
        return;
      }

      if (targetStatus === "CANCELLED") {
        // Si cancelás una reserva: reponemos stock SOLO si no estaba pagada
        if (ord.status !== "PAID") {
          for (const it of ord.items) {
            await tx.product.update({
              where: { id: it.productId },
              data: { stock: { increment: it.quantity } },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });
      }
    });

    console.log("MP webhook OK", { type, paymentId, status, orderId });

    return res.sendStatus(200);
  } catch (err) {
    console.log("MP webhook error", err);
    // importante: responder 200 para que no te mate con reintentos mientras debuggeás
    return res.sendStatus(200);
  }
});

export default router;
