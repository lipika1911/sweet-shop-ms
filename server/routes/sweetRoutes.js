import express from "express";
import { createSweet, deleteSweet, getSweets, purchaseSweet, restockSweet, searchSweets, updateSweet } from "../controllers/sweetController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, createSweet);
router.get("/", authMiddleware, getSweets);
router.get("/search", authMiddleware, searchSweets);
router.put("/:id", authMiddleware, adminMiddleware, updateSweet);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSweet);
router.post("/:id/purchase", authMiddleware, purchaseSweet);
router.post("/:id/restock", authMiddleware, adminMiddleware, restockSweet);

export default router;
