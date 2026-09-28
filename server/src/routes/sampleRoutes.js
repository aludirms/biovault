import express from "express";
import {
  getSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample,
} from "../controllers/sampleController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getSamples);
router.get("/:id", requireAuth, getSampleById);
router.post("/", requireAuth, createSample);
router.put("/:id", requireAuth, updateSample);
router.delete("/:id", requireAuth, deleteSample);

export default router;
