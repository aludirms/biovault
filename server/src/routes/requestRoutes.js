import express from "express";
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getRequests);
router.get("/:id", requireAuth, getRequestById);
router.post("/", requireAuth, createRequest);
router.patch("/:id/status", requireAuth, updateRequestStatus);

export default router;
