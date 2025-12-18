var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import prisma from "../prisma.js";
const router = Router();
// Crear usuario
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.create({
            data: { email, password },
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ error: "No se pudo crear el usuario" });
    }
}));
// Obtener usuario
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const user = yield prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(user);
}));
export default router;
//# sourceMappingURL=users.js.map