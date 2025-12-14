import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import adminMiddleware from "./middleware/adminMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Server is Live!");
});

app.use("/api/auth", authRoutes);

app.get(
  "/api/admin-test",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

export default app;
