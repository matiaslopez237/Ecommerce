import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
const router = Router();
router.get("/me", requireAuth, async (req, res) => {
    const userId = req.user?.sub;
    if (!userId)
        return res.status(401).json({ error: "Token inválido" });
    const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: { id: true, username: true, points: true, createdAt: true, role: true },
    });
    if (!user)
        return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(user);
});
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
        return res.status(400).json({ error: "ID inválido" });
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, username: true, points: true, createdAt: true },
    });
    if (!user)
        return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(user);
});
export default router;
//# sourceMappingURL=users.js.map