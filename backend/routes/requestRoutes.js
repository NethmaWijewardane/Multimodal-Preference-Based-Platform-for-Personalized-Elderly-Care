import express from "express";
import Request from "../models/request.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();


router.post("/", requireAuth, async (req, res) => {
  try {
    const { caregiverId, serviceNumber, requestDate, requestTime } = req.body;

    if (!caregiverId) {
      return res.status(400).json({ message: "caregiverId is required" });
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


router.put("/:id/accept", requireAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.caregiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "accepted";
    const updated = await request.save();

    res.json(updated);

  } catch (err) {
    console.error("❌ Accept request error:", err);
    res.status(500).json({ message: err.message });
  }
});


router.put("/:id/decline", requireAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.caregiver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "declined";
    const updated = await request.save();

    res.json(updated);

  } catch (err) {
    console.error("❌ Decline request error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;