import express from "express";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/caregivers", requireAuth, async (req, res) => {
  const caregivers = await User.find({ role: "caregiver" }).select("-password");
  res.json(caregivers);
});

export default router;
