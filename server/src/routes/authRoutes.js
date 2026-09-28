import express from "express";
import { login, register, getProfile, getAllStaff } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/profile", requireAuth, getProfile);
router.get("/staff", requireAuth, getAllStaff);

export default router;
