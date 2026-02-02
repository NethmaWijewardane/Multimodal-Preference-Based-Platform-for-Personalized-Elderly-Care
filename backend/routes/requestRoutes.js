import express from "express";
import Request from "../models/request.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const request = await Request.create({
    elderly: req.session.userId,
    caregiver: req.body.caregiverId
  });
  res.status(201).json(request);
});

router.get("/my", requireAuth, async (req, res) => {
  const requests = await Request.find({ elderly: req.session.userId })
    .populate("caregiver", "name email");
  res.json(requests);
});

export default router;
