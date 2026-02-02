import express from "express";
import Feedback from "../models/feedback.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:caregiverId", requireAuth, async (req, res) => {
  const feedbacks = await Feedback.find({
    caregiver: req.params.caregiverId
  });
  res.json(feedbacks);
});

export default router;
