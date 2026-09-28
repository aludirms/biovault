import express from "express";
import {
  getFreezers,
  getFreezerById,
  getBoxGrid,
} from "../controllers/storageController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/freezers", requireAuth, getFreezers);
router.get("/freezers/:id", requireAuth, getFreezerById);
router.get("/grid/:freezerId/:rackId/:boxId", requireAuth, getBoxGrid);

export default router;
