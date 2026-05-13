import { Router } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
const router = Router();
router.use(requireAuth);
// POST /orders -> crea orden desde carrito
router.post("/", async (req, res) => {
    const userId = Number(req.user?.sub);
    if (!userId)
        return res.status(401).json({ error: "Token inválido" });
    try {
        const result = await prisma.$transaction(async (tx) => {
            const cartItems = await tx.cartItem.findMany({
                where: { userId },
                include: { product: { select: { id: true, name: true, price: true, stock: true } } },
            });
            if (cartItems.length === 0) {
                return { kind: "empty" };
            }
            // Validar stock
            for (const it of cartItems) {
                if (it.quantity > it.product.stock) {
                    return {
                        kind: "no_stock",
                        productId: it.product.id,
                        productName: it.product.name,
                        stock: it.product.stock,
                        requested: it.quantity,
                    };
                }
            }
            // Calcular total
            let total = new Prisma.Decimal(0);
            const itemsData = cartItems.map((it) => {
                const unitPrice = it.product.price; // Decimal
                const subtotal = unitPrice.mul(it.quantity);
                total = total.add(subtotal);
                return {
                    productId: it.productId,
                    quantity: it.quantity,
                    unitPrice,
                    subtotal,
                };
            });
            // Crear orden
            const order = await tx.order.create({
                data: {
                    userId,
                    total,
                    items: { create: itemsData },
                },
                include: { items: true },
            });
            // Descontar stock
            for (const it of cartItems) {
                await tx.product.update({
                    where: { id: it.productId },
                    data: { stock: { decrement: it.quantity } },
                });
            }
            // Vaciar carrito
            await tx.cartItem.deleteMany({ where: { userId } });
            return { kind: "ok", order };
        });
        if (result.kind === "empty") {
            return res.status(400).json({ error: "El carrito está vacío" });
        }
        if (result.kind === "no_stock") {
            return res.status(409).json({ error: "Stock insuficiente", ...result });
        }
        res.status(201).json(result.order);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
});
// GET /orders -> mis órdenes
router.get("/", async (req, res) => {
    const userId = Number(req.user?.sub);
    const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
    });
    res.json(orders);
});
// GET /orders/:id -> detalle (solo dueño)
router.get("/:id", async (req, res) => {
    const userId = Number(req.user?.sub);
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
        return res.status(400).json({ error: "ID inválido" });
    const order = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: { select: { id: true, name: true } } } } },
    });
    if (!order)
        return res.status(404).json({ error: "Orden no encontrada" });
    if (order.userId !== userId)
        return res.status(403).json({ error: "No autorizado" });
    res.json(order);
});
export default router;
//# sourceMappingURL=orders.js.map