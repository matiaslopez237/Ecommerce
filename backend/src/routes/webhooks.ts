import { Router } from "express";
import crypto from "crypto";
import prisma from "../prisma.js";

const router = Router();

function parseXSignature(xSignature: string | undefined) {
  if (!xSignature) return null;
  // formato típico: "ts=...,v1=..."
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

function getNotificationId(req: any): string | undefined {
  // MP puede mandar en query: data.id / id, o en body: { data: { id } }
  return (
    req.query?.["data.id"] ||
    req.query?.["data_id"] ||
    req.query?.["id"] ||
    req.body?.data?.id
  )?.toString();
}

router.post("/mercadopago", async (req, res) => {
  const notificationId = getNotificationId(req);
  const type = (req.query?.type || req.query?.topic || req.body?.type || "").toString();

  // Respondé rápido aunque no puedas procesar (MP reintenta)
  if (!notificationId) return res.sendStatus(200);

  // Validación de firma (HMAC SHA256 con manifest: id:...;request-id:...;ts:...;)
  // Se usa x-signature + x-request-id + secret. :contentReference[oaicite:4]{index=4}
  const secret = process.env.MP_WEBHOOK_SECRET;
  const xSignature = req.headers["x-signature"]?.toString();
  const xRequestId = req.headers["x-request-id"]?.toString();

  if (secret && xSignature && xRequestId) {
    const parsed = parseXSignature(xSignature);
    if (!parsed) return res.sendStatus(401);

    const manifest = `id:${notificationId};request-id:${xRequestId};ts:${parsed.ts};`;
    const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

    if (expected.toLowerCase() !== parsed.v1.toLowerCase()) {
      return res.sendStatus(401);
    }
  }

  // Solo procesamos pagos (si te llega merchant_order lo podés ignorar o ampliar)
  if (type && type !== "payment") {
    return res.sendStatus(200);
  }

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
  if (!MP_ACCESS_TOKEN) return res.sendStatus(200);

  // Confirmá el pago consultando la API por ID :contentReference[oaicite:5]{index=5}
  const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${notificationId}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
  });

  if (!mpResp.ok) return res.sendStatus(200);

  const payment = await mpResp.json();
  const externalRef = payment.external_reference; // nosotros pusimos order.id acá
  const paymentStatus = (payment.status || "").toString(); // approved, rejected, cancelled, etc.

  const orderId = Number(externalRef);
  if (!Number.isFinite(orderId)) return res.sendStatus(200);

  // Estado destino según MP
  const target =
    paymentStatus === "approved"
      ? "PAID"
      : ["cancelled", "rejected", "expired"].includes(paymentStatus)
      ? "CANCELLED"
      : null;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    // Guardar/actualizar payment (idempotente)
    await tx.payment.upsert({
      where: { orderId: order.id },
      create: {
        provider: "MERCADOPAGO",
        orderId: order.id,
        providerPaymentId: String(payment.id),
        status: paymentStatus,
        raw: payment,
      },
      update: {
        providerPaymentId: String(payment.id),
        status: paymentStatus,
        raw: payment,
      },
    });

    // Solo cambiar si está PENDING (idempotencia)
    if (!target || order.status !== "PENDING") return;

    // (opcional) Validar monto: transaction_amount vs order.total
    // si no coincide, NO lo marques pagado:
    // const amountOk = Number(payment.transaction_amount) === Number(order.total.toString());

    if (target === "PAID") {
      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    }

    if (target === "CANCELLED") {
      // Reponer stock si cancelás una reserva
      for (const it of order.items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { increment: it.quantity } },
        });
      }
      await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    }
  });

  res.sendStatus(200);
});

export default router;
