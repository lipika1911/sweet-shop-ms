import express from "express";
import { createSweet, getSweets, searchSweets } from "../controllers/sweetController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createSweet);
router.get("/", authMiddleware, getSweets);
router.get("/search", authMiddleware, searchSweets);

export default router;
