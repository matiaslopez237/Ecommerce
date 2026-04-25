import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { sendVerificationEmail } from "../services/email.js";

const router = Router();

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "email y password son requeridos" });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@")) {
      return res.status(400).json({ error: "email inválido" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "password muy corta (mínimo 6)" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        email: cleanEmail,
        password: passwordHash,
        role: "USER",
        points: 0,
        emailVerified: false,
        verificationToken,
      },
    });

    // Enviar email de verificación (no bloqueamos si falla)
    try {
      await sendVerificationEmail(cleanEmail, verificationToken);
    } catch (emailErr) {
      console.error("Error enviando email de verificación:", emailErr);
    }

    return res.status(201).json({
      message: "Cuenta creada. Revisá tu email para confirmarla.",
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ error: "Ese email ya está registrado" });
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno" });
  }
});

// GET /auth/verify-email?token=xxx
router.get("/verify-email", async (req, res) => {
  const { token } = req.query as { token?: string };

  if (!token) {
    return res.status(400).json({ error: "Token requerido" });
  }

  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) {
    return res.status(400).json({ error: "Token inválido o ya utilizado" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "JWT_SECRET no configurado" });

  const jwtToken = jwt.sign({ sub: user.id, email: user.email }, secret, {
    expiresIn: "1h",
  });

  return res.json({
    message: "Email verificado correctamente",
    token: jwtToken,
    user: {
      id: user.id,
      email: user.email,
      points: user.points,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos: email y password" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  if (!user.emailVerified) {
    return res.status(403).json({
      error: "Confirmá tu email antes de ingresar. Revisá tu bandeja de entrada.",
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "JWT_SECRET no configurado" });

  const token = jwt.sign({ sub: user.id, email: user.email }, secret, {
    expiresIn: "1h",
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      points: user.points,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

// GET /auth/me
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
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) return res.status(404).json({ error: "Usuario no existe" });

  return res.json({ user });
});

export default router;
