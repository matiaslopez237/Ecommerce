import { Router, type Request } from "express";
import crypto from "crypto";
import prisma from "../prisma.js";

const router = Router();

function first<T>(v: T | T[] | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function parseXSignature(xSignature: string) {
  // formato: "ts=...,v1=..."
  const parts = xSignature.split(",").map((p) => p.trim());
  let ts: string | undefined;
  let v1: string | undefined;

  for (const p of parts) {
    const [k, val] = p.split("=").map((s) => s.trim());
    if (k === "ts") ts = val;
    if (k === "v1") v1 = val;
  }

  if (!ts || !v1) return null;
  return { ts, v1 };
}

function verifyMercadoPagoSignature(req: Request, id: string): boolean {
  const secret = (process.env.MP_WEBHOOK_SECRET ?? "").trim();
  if (!secret) return true; // si no configurás secret, no bloquea (modo dev)

  const xSignature = req.header("x-signature");
  const xRequestId = req.header("x-request-id");
  if (!xSignature || !xRequestId) return false;

  const parsed = parseXSignature(xSignature);
  if (!parsed) return false;

  const manifest = `id:${id};request-id:${xRequestId};ts:${parsed.ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex")
    .toLowerCase();

  const received = parsed.v1.toLowerCase();

  // comparación segura (si longitudes difieren, falla)
  if (expected.length !== received.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(received, "utf8")
  );
}

async function fetchMerchantOrder(merchantOrderId: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;

  const resp = await fetch(
    `https://api.mercadopago.com/merchant_orders/${merchantOrderId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!resp.ok) return null;
  return resp.json();
}

async function fetchPayment(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;

  const resp = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!resp.ok) return null;
  return resp.json();
}

router.post("/mercadopago", async (req, res) => {
  try {
    const q = req.query as Record<string, any>;
    const body: any = req.body ?? {};

    const type =
      (first(q.type) ??
        first(q.topic) ??
        body.type ??
        body.topic ??
        undefined) as string | undefined;

    const notificationId =
      first(q["data.id"]) ?? first(q.id) ?? body?.data?.id ?? body?.id ?? null;

    if (!notificationId) {
      return res.sendStatus(200);
    }

    const notifIdStr = String(notificationId);

    console.log("MP webhook HIT", {
      type,
      notificationId: notifIdStr,
      hasSignature: Boolean(req.header("x-signature")),
      hasRequestId: Boolean(req.header("x-request-id")),
    });

    // 1) Validar firma con el ID que llega en la notificación
    let signatureOk = verifyMercadoPagoSignature(req, notifIdStr);

    // 2) Si vino merchant_order y falla, intentamos validar con el paymentId (fallback)
    // (algunas integraciones reportan que MP firma con paymentId en ciertos casos)
    let merchantOrder: any = null;
    if (!signatureOk && type === "merchant_order") {
      merchantOrder = await fetchMerchantOrder(notifIdStr);
      const approved =
        (merchantOrder?.payments ?? []).find((p: any) => p?.status === "approved") ??
        (merchantOrder?.payments ?? [])[0];

      const candidatePaymentId = approved?.id ? String(approved.id) : null;

      if (candidatePaymentId) {
        signatureOk = verifyMercadoPagoSignature(req, candidatePaymentId);
      }
    }

    if (!signatureOk) {
      console.log("MP signature INVALID", { type, notificationId: notifIdStr });
      return res.status(401).json({ error: "Firma inválida" });
    }

    // Resolver paymentId
    let paymentId = notifIdStr;

    if (type === "merchant_order") {
      merchantOrder = merchantOrder ?? (await fetchMerchantOrder(notifIdStr));
      const approved =
        (merchantOrder?.payments ?? []).find((p: any) => p?.status === "approved") ??
        (merchantOrder?.payments ?? [])[0];

      if (!approved?.id) return res.sendStatus(200);
      paymentId = String(approved.id);
    } else {
      // si type viene vacío, lo tratamos como payment
      if (type && type !== "payment") return res.sendStatus(200);
    }

    const payment = await fetchPayment(paymentId);
    if (!payment) {
      console.log("MP payment fetch FAILED", { paymentId });
      return res.sendStatus(200);
    }

    const mpStatus = String(payment?.status ?? "");
    const externalRef =
      payment?.external_reference ??
      payment?.metadata?.orderId ??
      payment?.metadata?.order_id;

    const orderId = Number(externalRef);
    if (!orderId || Number.isNaN(orderId)) {
      console.log("MP cannot resolve orderId", {
        paymentId,
        mpStatus,
        externalRef,
      });
      return res.sendStatus(200);
    }

    const targetStatus =
      mpStatus === "approved"
        ? "PAID"
        : ["cancelled", "rejected", "charged_back", "refunded"].includes(mpStatus)
          ? "CANCELLED"
          : null;

    if (!targetStatus) {
      // pending / in_process / etc.
      console.log("MP status ignored", { paymentId, mpStatus, orderId });
      return res.sendStatus(200);
    }

    await prisma.$transaction(async (tx) => {
      const ord = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!ord) return;

      if (ord.status === targetStatus) return;

      if (targetStatus === "PAID") {
        // solo marcamos PAID si estaba PENDING
        if (ord.status === "PENDING") {
          await tx.order.update({
            where: { id: orderId },
            data: { status: "PAID" },
          });
        }
        return;
      }

      // CANCELLED
      if (ord.status !== "PAID") {
        // reponer stock si no estaba pagada
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
    });

    console.log("MP webhook OK", { type, paymentId, mpStatus, orderId, targetStatus });

    return res.sendStatus(200);
  } catch (err) {
    console.log("MP webhook ERROR", err);
    // para que no te masacre con reintentos mientras debuggeás
    return res.sendStatus(200);
  }
});

export default router;
