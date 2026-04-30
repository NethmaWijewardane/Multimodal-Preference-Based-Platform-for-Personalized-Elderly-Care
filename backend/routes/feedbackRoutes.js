import express from "express";
import Feedback from "../models/feedback.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();


router.post("/", requireAuth, async (req, res) => {
  try {
    const { caregiverId, requestId, rating, feedback } = req.body;

    if (!caregiverId || !requestId) {
      return res.status(400).json({
        success: false,
        message: "caregiverId and requestId are required"
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const existing = await Feedback.findOne({
      request: requestId,
      elderly: req.user.id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted for this request"
      });
    }

    const newFeedback = await Feedback.create({
      elderly: req.user.id,
      caregiver: caregiverId,
      request: requestId,
      rating: Number(rating),
      feedback: feedback || ""
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: newFeedback
    });

  } catch (err) {
    console.error("❌ Create feedback error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while submitting feedback"
    });
  }
});


router.get("/:caregiverId", requireAuth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      caregiver: req.params.caregiverId
    }).populate("elderly", "name");

    return res.status(200).json({
      success: true,
      data: feedbacks
    });

  } catch (err) {
    console.error("❌ Get feedback error:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching feedback"
    });
  }
});

export default router;