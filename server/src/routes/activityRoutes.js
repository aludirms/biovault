import express from "express";
import {
  getActivityLogs,
  getChainOfCustody,
} from "../controllers/activityController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/logs", requireAuth, getActivityLogs);
router.get("/custody/:sampleId", requireAuth, getChainOfCustody);

export default router;
