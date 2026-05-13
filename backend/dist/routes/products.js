import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
const router = Router();
// GET /products (público)
// opcional: /products?categoryId=1
router.get("/", async (req, res) => {
    const raw = req.query.categoryId;
    let categoryId;
    if (typeof raw === "string" && raw.trim() !== "") {
        const n = Number(raw);
        if (Number.isFinite(n))
            categoryId = n;
    }
    const args = {
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
    };
    if (categoryId !== undefined) {
        args.where = { categoryId };
    }
    const products = await prisma.product.findMany(args);
    res.json(products);
});
// GET /products/:id (público)
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
        return res.status(400).json({ error: "ID inválido" });
    const product = await prisma.product.findUnique({
        where: { id },
        include: { category: { select: { id: true, name: true } } },
    });
    if (!product)
        return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
});
// POST /products (ADMIN)
router.post("/", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, imageUrl } = req.body;
        if (!name?.trim())
            return res.status(400).json({ error: "name es requerido" });
        if (price === undefined || price === null)
            return res.status(400).json({ error: "price es requerido" });
        const priceStr = typeof price === "number" ? String(price) : price;
        const priceNum = Number(priceStr);
        if (!Number.isFinite(priceNum))
            return res.status(400).json({ error: "price inválido" });
        const stockInt = stock ?? 0;
        if (!Number.isFinite(stockInt) || stockInt < 0) {
            return res.status(400).json({ error: "stock inválido" });
        }
        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                price: priceStr, // Decimal -> ok como string
                stock: stockInt,
                categoryId: categoryId ?? null,
                imageUrl: imageUrl && imageUrl.trim() !== "" ? imageUrl.trim() : null, // ✅ NUEVO
            },
            include: { category: { select: { id: true, name: true } } },
        });
        res.status(201).json(product);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
});
// PATCH /products/:id (ADMIN)
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
        return res.status(400).json({ error: "ID inválido" });
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    const data = {};
    if (name !== undefined) {
        if (!name.trim())
            return res.status(400).json({ error: "name inválido" });
        data.name = name.trim();
    }
    if (description !== undefined) {
        data.description = description === null ? null : description.trim();
    }
    if (price !== undefined) {
        const priceStr = typeof price === "number" ? String(price) : price;
        const priceNum = Number(priceStr);
        if (!Number.isFinite(priceNum))
            return res.status(400).json({ error: "price inválido" });
        data.price = priceStr; // Prisma acepta string para Decimal
    }
    if (stock !== undefined) {
        if (!Number.isFinite(stock) || stock < 0)
            return res.status(400).json({ error: "stock inválido" });
        data.stock = stock;
    }
    if (categoryId !== undefined) {
        data.category =
            categoryId === null ? { disconnect: true } : { connect: { id: categoryId } };
    }
    // ✅ NUEVO: imageUrl
    if (imageUrl !== undefined) {
        data.imageUrl = imageUrl === null ? null : imageUrl.trim();
        if (typeof data.imageUrl === "string" && data.imageUrl.trim() === "") {
            data.imageUrl = null; // si mandan "" lo dejamos en null
        }
    }
    try {
        const updated = await prisma.product.update({
            where: { id },
            data,
            include: { category: { select: { id: true, name: true } } },
        });
        res.json(updated);
    }
    catch (err) {
        if (err?.code === "P2025")
            return res.status(404).json({ error: "Producto no encontrado" });
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
});
export default router;
//# sourceMappingURL=products.js.map