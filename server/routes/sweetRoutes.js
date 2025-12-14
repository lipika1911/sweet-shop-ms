import express from "express";
import { createSweet, getSweets } from "../controllers/sweetController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createSweet);
router.get("/", authMiddleware, getSweets);

export default router;
