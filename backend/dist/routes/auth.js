import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
const router = Router();
function makeToken(userId, username) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET no configurado");
    return jwt.sign({ sub: userId, username }, secret, { expiresIn: "7d" });
}
function userPayload(u) {
    return { id: u.id, username: u.username, points: u.points, role: u.role, createdAt: u.createdAt, updatedAt: u.updatedAt };
}
// POST /auth/register
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username?.trim() || !password) {
            return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
        }
        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername.length < 3) {
            return res.status(400).json({ error: "El usuario debe tener al menos 3 caracteres" });
        }
        if (!/^[a-z0-9_.]+$/.test(cleanUsername)) {
            return res.status(400).json({ error: "Solo letras, números, puntos y guiones bajos" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres" });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username: cleanUsername, password: passwordHash },
        });
        const token = makeToken(user.id, user.username);
        return res.status(201).json({ token, user: userPayload(user) });
    }
    catch (err) {
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "Ese usuario ya está registrado" });
        }
        console.error(err);
        return res.status(500).json({ error: "Error interno" });
    }
});
// POST /auth/login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username?.trim() || !password) {
            return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
        }
        const user = await prisma.user.findUnique({
            where: { username: username.trim().toLowerCase() },
        });
        if (!user)
            return res.status(401).json({ error: "Credenciales inválidas" });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            return res.status(401).json({ error: "Credenciales inválidas" });
        const token = makeToken(user.id, user.username);
        return res.json({ token, user: userPayload(user) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno" });
    }
});
// GET /auth/me
router.get("/me", requireAuth, async (req, res) => {
    const payload = req.user;
    const userId = Number(payload?.sub);
    if (!userId)
        return res.status(401).json({ error: "No autorizado" });
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, points: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user)
        return res.status(404).json({ error: "Usuario no existe" });
    return res.json({ user });
});
export default router;
//# sourceMappingURL=auth.js.map