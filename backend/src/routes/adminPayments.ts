import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Solo ADMIN
router.use(requireAuth, requireAdmin);

/**
 * GET /admin/payments
 * Query opcional:
 * - status, providerPaymentId, preferenceId, merchantOrderId
 * - orderId, userId
 * - page (default 1), pageSize (default 20)
 */
router.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20)));
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (req.query.status) where.status = String(req.query.status);
  if (req.query.providerPaymentId) where.providerPaymentId = String(req.query.providerPaymentId);
  if (req.query.preferenceId) where.preferenceId = String(req.query.preferenceId);
  if (req.query.merchantOrderId) where.merchantOrderId = String(req.query.merchantOrderId);

  if (req.query.orderId) where.orderId = Number(req.query.orderId);
  if (req.query.userId) where.order = { userId: Number(req.query.userId) };

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        provider: true,
        orderId: true,
        preferenceId: true,
        providerPaymentId: true,
        merchantOrderId: true,
        status: true,
        statusDetail: true,
        amount: true,
        currency: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        // NO devolvemos raw/rawPayment en lista (pesado)
        order: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            user: { select: { id: true, email: true } },
          },
        },
      },
    }),
  ]);

  // Decimal -> string para JSON
  const data = payments.map((p) => ({
    ...p,
    amount: p.amount?.toString?.() ?? String(p.amount),
    order: p.order
      ? { ...p.order, total: p.order.total?.toString?.() ?? String(p.order.total) }
      : null,
  }));

  res.json({
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    data,
  });
});

/**
 * GET /admin/payments/:orderId
 * Devuelve el Payment (por orderId) con raw + rawPayment + detalles de orden/items.
 */
router.get("/:orderId", async (req, res) => {
  const orderId = Number(req.params.orderId);
  if (!orderId) return res.status(400).json({ error: "orderId inválido" });

  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: {
      order: {
        include: {
          user: { select: { id: true, email: true, role: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, price: true } },
            },
          },
        },
      },
    },
  });

  if (!payment) return res.status(404).json({ error: "Payment no encontrado" });

  res.json({
    ...payment,
    amount: payment.amount?.toString?.() ?? String(payment.amount),
    order: payment.order
      ? {
          ...payment.order,
          total: payment.order.total?.toString?.() ?? String(payment.order.total),
          items: payment.order.items.map((it) => ({
            ...it,
            unitPrice: it.unitPrice?.toString?.() ?? String(it.unitPrice),
            subtotal: it.subtotal?.toString?.() ?? String(it.subtotal),
            product: it.product
              ? { ...it.product, price: it.product.price?.toString?.() ?? String(it.product.price) }
              : null,
          })),
        }
      : null,
  });
});

export default router;
