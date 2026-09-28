import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import sampleRoutes from "./routes/sampleRoutes.js";
import storageRoutes from "./routes/storageRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database connection (with fallback)
connectDB();

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    system: "BioVault Biobank Operations API",
    version: "2.4.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/samples", sampleRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[BioVault Server] Ready & listening on http://localhost:${PORT}`);
});
