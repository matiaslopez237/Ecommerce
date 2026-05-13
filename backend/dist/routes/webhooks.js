import { Router } from "express";
import crypto from "crypto";
import prisma from "../prisma.js";
const router = Router();
/** Devuelve el primer valor si viene como array (querystring). */
function first(v) {
    return Array.isArray(v) ? v[0] : v;
}
/** Limpia comillas/espacios por si el env viene con "..." */
function cleanSecret(s) {
    return s.trim().replace(/^['"]|['"]$/g, "");
}
function parseXSignature(xSignature) {
    // formato típico: "ts=...,v1=..."
    const tsMatch = xSignature.match(/(?:^|,)\s*ts=([^,]+)/i);
    const v1Match = xSignature.match(/(?:^|,)\s*v1=([^,]+)/i);
    const tsRaw = tsMatch?.[1];
    const v1Raw = v1Match?.[1];
    if (!tsRaw || !v1Raw)
        return null;
    const ts = tsRaw.trim();
    const v1 = v1Raw.trim();
    if (!ts || !v1)
        return null;
    return { ts, v1 };
}
function safeEqualBytes(a, b) {
    if (a.length !== b.length)
        return false;
    return crypto.timingSafeEqual(a, b);
}
function isHexString(s) {
    return /^[0-9a-fA-F]+$/.test(s) && s.length % 2 === 0;
}
/**
 * Valida firma de Mercado Pago usando MP_WEBHOOK_SECRET.
 * Si NO hay secret configurado, devuelve ok=true (modo dev).
 *
 * Firma (según MP):
 * HMAC SHA256(secret, `id:${id};request-id:${reqId};ts:${ts};`)
 * y se compara con v1 del header x-signature.
 */
function verifyMercadoPagoSignature(req, id) {
    const rawSecret = process.env.MP_WEBHOOK_SECRET;
    if (!rawSecret || !rawSecret.trim())
        return { ok: true }; // dev mode
    const secret = cleanSecret(rawSecret);
    const xSignature = req.header("x-signature");
    const xRequestId = req.header("x-request-id");
    if (!xSignature || !xRequestId)
        return { ok: false, reason: "missing headers" };
    const parsed = parseXSignature(xSignature);
    if (!parsed)
        return { ok: false, reason: "bad x-signature format" };
    const manifest = `id:${id};request-id:${xRequestId};ts:${parsed.ts};`;
    const expectedHex = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
    const receivedHex = parsed.v1.trim().toLowerCase();
    // asegurar hex válido + comparación segura
    if (!isHexString(receivedHex))
        return { ok: false, reason: "received v1 is not hex" };
    const ok = safeEqualBytes(Buffer.from(expectedHex, "hex"), Buffer.from(receivedHex, "hex"));
    return ok ? { ok: true } : { ok: false, reason: "signature mismatch" };
}
async function fetchMerchantOrder(merchantOrderId) {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token)
        return null;
    const resp = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok)
        return null;
    return resp.json();
}
async function fetchPayment(paymentId) {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token)
        return null;
    const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok)
        return null;
    return resp.json();
}
router.post("/mercadopago", async (req, res) => {
    try {
        const q = req.query;
        const body = req.body ?? {};
        const type = (first(q.type) ?? first(q.topic) ?? body.type ?? body.topic ?? undefined);
        const notificationId = first(q["data.id"]) ?? first(q.id) ?? body?.data?.id ?? body?.id ?? null;
        if (!notificationId)
            return res.sendStatus(200);
        const notifIdStr = String(notificationId);
        console.log("MP webhook HIT", {
            type,
            notificationId: notifIdStr,
            hasSignature: Boolean(req.header("x-signature")),
            hasRequestId: Boolean(req.header("x-request-id")),
        });
        // ✅ Validación de firma
        const sig = verifyMercadoPagoSignature(req, notifIdStr);
        // IMPORTANTE: durante debug conviene NO responder 401 (MP reintenta en loop)
        // Si querés modo estricto, seteá MP_ENFORCE_SIGNATURE=true en Render.
        const enforce = process.env.MP_ENFORCE_SIGNATURE === "true";
        if (!sig.ok) {
            console.log("MP signature INVALID", { type, notificationId: notifIdStr, reason: sig.reason });
            if (enforce)
                return res.status(401).json({ error: "Firma inválida" });
            // si no enforce, seguimos igual (pero logueado)
        }
        // Resolver paymentId real
        let paymentId = notifIdStr;
        let merchantOrder = null;
        if (type === "merchant_order") {
            merchantOrder = await fetchMerchantOrder(notifIdStr);
            const approved = (merchantOrder?.payments ?? []).find((p) => p?.status === "approved") ??
                (merchantOrder?.payments ?? [])[0];
            if (!approved?.id)
                return res.sendStatus(200);
            paymentId = String(approved.id);
        }
        else {
            if (type && type !== "payment")
                return res.sendStatus(200);
        }
        const payment = await fetchPayment(paymentId);
        if (!payment) {
            console.log("MP payment fetch FAILED", { paymentId });
            return res.sendStatus(200);
        }
        const mpStatus = String(payment?.status ?? "");
        const externalRef = payment?.external_reference ??
            payment?.metadata?.orderId ??
            payment?.metadata?.order_id;
        const orderId = Number(externalRef);
        if (!orderId || Number.isNaN(orderId)) {
            console.log("MP cannot resolve orderId", { paymentId, mpStatus, externalRef });
            return res.sendStatus(200);
        }
        const targetStatus = mpStatus === "approved"
            ? "PAID"
            : ["cancelled", "rejected", "charged_back", "refunded"].includes(mpStatus)
                ? "CANCELLED"
                : null;
        if (!targetStatus) {
            console.log("MP status ignored", { paymentId, mpStatus, orderId });
            return res.sendStatus(200);
        }
        await prisma.$transaction(async (tx) => {
            const ord = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });
            if (!ord)
                return;
            const mpPaymentId = String(payment?.id ?? paymentId);
            const mpStatusNow = String(payment?.status ?? "");
            const mpStatusDetail = payment?.status_detail ? String(payment.status_detail) : null;
            // merchant order id si viene
            const mpMerchantOrderId = payment?.order?.id ? String(payment.order.id) :
                (type === "merchant_order" ? String(notifIdStr) : null);
            const paidAtValue = mpStatusNow === "approved" ? new Date() : null;
            await tx.payment.upsert({
                where: { orderId },
                create: {
                    provider: "MERCADOPAGO",
                    orderId,
                    providerPaymentId: mpPaymentId,
                    merchantOrderId: mpMerchantOrderId,
                    status: mpStatusNow,
                    statusDetail: mpStatusDetail,
                    amount: ord.total,
                    currency: String(payment?.currency_id ?? "ARS"),
                    rawPayment: payment,
                    paidAt: paidAtValue, // en create sí puede ir null
                },
                update: {
                    providerPaymentId: mpPaymentId,
                    merchantOrderId: mpMerchantOrderId,
                    status: mpStatusNow,
                    statusDetail: mpStatusDetail,
                    amount: ord.total,
                    currency: String(payment?.currency_id ?? "ARS"),
                    rawPayment: payment,
                    // 👇 NO mandamos undefined nunca:
                    ...(mpStatusNow === "approved" ? { paidAt: new Date() } : {}),
                    // opcional: si querés que al cancelarse se borre paidAt:
                    // ...(mpStatusNow !== "approved" ? { paidAt: null } : {}),
                },
            });
            // idempotente
            if (ord.status === targetStatus)
                return;
            if (targetStatus === "PAID") {
                if (ord.status === "PENDING") {
                    await tx.order.update({
                        where: { id: orderId },
                        data: { status: "PAID" },
                    });
                }
                return;
            }
            // CANCELLED: reponer stock si no estaba pagada
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
        });
        console.log("MP webhook OK", { type, paymentId, mpStatus, orderId, targetStatus });
        return res.sendStatus(200);
    }
    catch (err) {
        console.log("MP webhook ERROR", err);
        return res.sendStatus(200);
    }
});
export default router;
//# sourceMappingURL=webhooks.js.map