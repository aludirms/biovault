import express from "express";
import { getDashboardOverview } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", requireAuth, getDashboardOverview);

export default router;
