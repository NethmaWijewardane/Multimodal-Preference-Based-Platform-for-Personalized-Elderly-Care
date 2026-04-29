import express from "express";
import Request from "../models/request.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();


// ===============================
// ✅ CREATE REQUEST
// ===============================
router.post("/", requireAuth, async (req, res) => {
  try {
    const { caregiverId, serviceNumber, requestDate, requestTime } = req.body;

    if (!caregiverId) {
      return res.status(400).json({ message: "caregiverId is required" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized - no user found" });
    }

    const request = await Request.create({
      elderly: req.user.id,
      caregiver: caregiverId,
      serviceNumber,
      requestDate,
      requestTime,
      status: "pending"
    });

    res.status(201).json(request);

  } catch (err) {
    console.error("❌ Create request error:", err);
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ✅ GET REQUESTS (ELDERLY)
// ===============================
router.get("/my", requireAuth, async (req, res) => {
  try {
    const requests = await Request.find({ elderly: req.user.id })
      .populate("caregiver", "name email");

    res.json(requests);
  } catch (err) {
    console.error("❌ Get elderly requests error:", err);
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ✅ GET REQUESTS (CAREGIVER DASHBOARD) ← FIX THAT WAS MISSING
// ===============================
router.get("/caregiver", requireAuth, async (req, res) => {
  try {
    const requests = await Request.find({ caregiver: req.user.id })
      .populate("elderly", "name email");

    res.json(requests);
  } catch (err) {
    console.error("❌ Get caregiver requests error:", err);
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ✅ ACCEPT REQUEST
// ===============================
router.put("/:id/accept", requireAuth, async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "accepted" },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===============================
// ❌ DECLINE REQUEST
// ===============================
router.put("/:id/decline", requireAuth, async (req, res) => {
  try {
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "declined" },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;