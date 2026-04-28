import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ---------------------------
   GET ALL CAREGIVERS
---------------------------- */
router.get("/caregivers", requireAuth, async (req, res) => {
  try {
    const caregivers = await User.find({ role: "caregiver" }).select("-password");
    res.json(caregivers);
  } catch (err) {
    console.error("ERROR fetching caregivers:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------
   SIGNUP
---------------------------- */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      location: req.body.location || "",
      languages: req.body.languages || [],
      activities: req.body.activities || [],
      experience: req.body.experience || 0,
      patience: req.body.patience || 0,
      hourlyRate: req.body.hourlyRate || 0
    });

    res.status(201).json({
      message: "Account created successfully",
      userId: user._id
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------
   SIGNIN (FIXED - MATCH FRONTEND)
---------------------------- */
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ JWT TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------------
   GET CURRENT USER (/me)
---------------------------- */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;