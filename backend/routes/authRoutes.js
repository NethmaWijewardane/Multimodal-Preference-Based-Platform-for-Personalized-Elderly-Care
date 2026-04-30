import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ---------------- SIGNUP ---------------- */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      location
    });

    res.status(201).json({
      message: "User created",
      userId: user._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------- SIGNIN ---------------- */
router.post("/signin", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    console.log("USER FROM TOKEN:", req.user);

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;