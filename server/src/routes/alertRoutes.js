import express from "express";
import {
  getAlerts,
  acknowledgeAlert,
  resolveAlert,
} from "../controllers/alertController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getAlerts);
router.patch("/:id/acknowledge", requireAuth, acknowledgeAlert);
router.patch("/:id/resolve", requireAuth, resolveAlert);

export default router;
