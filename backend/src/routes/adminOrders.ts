import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Prisma } from "@prisma/client";

const router = Router();

// Todo lo de /admin/orders requiere ser ADMIN
router.use(requireAuth, requireAdmin);

// GET /admin/orders  -> lista todas las órdenes
router.get("/", async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;

  const args: Prisma.OrderFindManyArgs = {
    include: {
      user: { select: { id: true, username: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  };

  if (status && ["PENDING", "PAID", "CANCELLED"].includes(status)) {
    args.where = { status: status as any };
  }

  const orders = await prisma.order.findMany(args);
  res.json(orders);
});


// GET /admin/orders/:id -> detalle
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
    },
  });

  if (!order) return res.status(404).json({ error: "Orden no encontrada" });
  res.json(order);
});

// PATCH /admin/orders/:id/status -> cambia estado
// Reglas (simple y seguro): solo permite PENDING -> PAID o PENDING -> CANCELLED
// Si CANCELLED, repone stock.
router.patch("/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "ID inválido" });

  const { status } = req.body as { status?: "PENDING" | "PAID" | "CANCELLED" };
  if (!status || !["PENDING", "PAID", "CANCELLED"].includes(status)) {
    return res.status(400).json({ error: "status inválido (PENDING | PAID | CANCELLED)" });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) return null;

      // reglas de transición
      if (order.status !== "PENDING") {
        // ya está PAID o CANCELLED -> no dejamos cambiar (evita inconsistencias de stock)
        throw Object.assign(new Error("TRANSITION_NOT_ALLOWED"), {
          current: order.status,
          target: status,
        });
      }

      // si cancela, devolvemos stock
      if (status === "CANCELLED") {
        for (const it of order.items) {
          await tx.product.update({
            where: { id: it.productId },
            data: { stock: { increment: it.quantity } },
          });
        }
      }

      const saved = await tx.order.update({
        where: { id },
        data: { status },
        include: {
          user: { select: { id: true, username: true } },
          items: { include: { product: { select: { id: true, name: true } } } },
        },
      });

      return saved;
    });

    if (!updated) return res.status(404).json({ error: "Orden no encontrada" });
    res.json(updated);
  } catch (err: any) {
    if (err?.message === "TRANSITION_NOT_ALLOWED") {
      return res.status(409).json({
        error: "Transición de estado no permitida (solo PENDING -> PAID/CANCELLED)",
        current: err.current,
        target: err.target,
      });
    }
    console.error(err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
