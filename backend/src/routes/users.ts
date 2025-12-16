import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// Crear usuario
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.create({
      data: { email, password },
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "Usuario ya existe o datos inválidos" });
  }
});

// Obtener usuario por ID
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, points: true },
  });

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  res.json(user);
});

export default router;
