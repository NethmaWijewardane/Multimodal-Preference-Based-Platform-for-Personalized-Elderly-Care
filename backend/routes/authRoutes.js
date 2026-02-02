import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------
// SIGNUP - create a new user
// ---------------------------
router.post("/signup", async (req, res) => {
  try {
    console.log("🔥 SIGNUP BODY RECEIVED:", req.body);

    // Check if email already exists
    const exists = await User.findOne({ email: req.body.email });
    if (exists) {
      console.log("❌ Email already exists:", req.body.email);
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create user
    const user = await User.create({
      ...req.body,
      password: hashedPassword
    });

    console.log("✅ USER CREATED:", user);

    res.status(201).json({ message: "Account created", userId: user._id });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// SIGNIN - login user
// ---------------------------
router.post("/signin", async (req, res) => {
  try {
    console.log("🔥 SIGNIN BODY RECEIVED:", req.body);

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log("❌ User not found:", req.body.email);
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      console.log("❌ Invalid credentials for:", req.body.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Save user session
    req.session.userId = user._id;
    req.session.role = user.role;

    console.log("✅ USER LOGGED IN:", user._id);

    res.json({ message: "Signed in", userId: user._id, role: user.role });
  } catch (err) {
    console.error("SIGNIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// GET CURRENT LOGGED-IN USER
// ---------------------------
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("GET /me ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// LOGOUT
// ---------------------------
router.post("/logout", requireAuth, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("elderly.sid");
    console.log("✅ USER LOGGED OUT");
    res.json({ message: "Logged out" });
  });
});

export default router;
