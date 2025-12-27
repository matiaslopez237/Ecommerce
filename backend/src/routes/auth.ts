import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos: email y password" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "JWT_SECRET no configurado" });

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    secret,
    { expiresIn: "1h" }
  );

  return res.json({
    token,
    user: { id: user.id, email: user.email, points: user.points, createdAt: user.createdAt, role: user.role},
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const payload = (req as any).user as { sub?: number | string };

  const userId = Number(payload?.sub);
  if (!userId) return res.status(401).json({ error: "No autorizado" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      points: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) return res.status(404).json({ error: "Usuario no existe" });

  return res.json({ user });
});


export default router;
