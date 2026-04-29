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
    let caregivers = await User.find({ role: "caregiver" }).select("-password");

    console.log("✅ Caregivers fetched:", caregivers.length);

    // ✅ FIX: normalize workingHours for frontend consistency
    caregivers = caregivers.map(cg => {
      const obj = cg.toObject();

      return {
        ...obj,
        workingHours:
          typeof obj.workingHours === "string"
            ? {
                start: obj.workingHours.split("-")[0]?.trim() || "",
                end: obj.workingHours.split("-")[1]?.trim() || ""
              }
            : obj.workingHours || { start: "", end: "" }
      };
    });

    return res.status(200).json(caregivers);

  } catch (err) {
    console.error("❌ ERROR fetching caregivers:", err);
    return res.status(500).json({ message: "Server error while fetching caregivers" });
  }
});

/* ---------------------------
   GET SINGLE CAREGIVER BY ID
---------------------------- */
router.get("/caregivers/:id", requireAuth, async (req, res) => {
  try {
    let caregiver = await User.findById(req.params.id).select("-password");

    if (!caregiver || caregiver.role !== "caregiver") {
      return res.status(404).json({ message: "Caregiver not found" });
    }

    const obj = caregiver.toObject();

    // ✅ FIX: normalize workingHours
    caregiver = {
      ...obj,
      workingHours:
        typeof obj.workingHours === "string"
          ? {
              start: obj.workingHours.split("-")[0]?.trim() || "",
              end: obj.workingHours.split("-")[1]?.trim() || ""
            }
          : obj.workingHours || { start: "", end: "" }
    };

    return res.status(200).json(caregiver);

  } catch (err) {
    console.error("❌ ERROR fetching caregiver:", err);
    return res.status(500).json({ message: "Server error while fetching caregiver" });
  }
});

/* ---------------------------
   SIGNUP
---------------------------- */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

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
      phone: phone || "",
      location: req.body.location || "",
      languages: req.body.languages || [],
      activities: req.body.activities || [],
      experience: req.body.experience || 0,
      patience: req.body.patience || 0,
      hourlyRate: req.body.hourlyRate || 0,
      profileImage: req.body.profileImage || null,

      workingHours: req.body.workingHours || {
        start: "",
        end: ""
      }
    });

    console.log("✅ New user created:", user.email, "| role:", user.role);

    return res.status(201).json({
      message: "Account created successfully",
      userId: user._id
    });

  } catch (err) {
    console.error("❌ SIGNUP ERROR:", err);
    return res.status(500).json({ message: "Server error during signup" });
  }
});

/* ---------------------------
   SIGNIN
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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("❌ SIGNIN ERROR:", err);
    return res.status(500).json({ message: "Server error during signin" });
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

    return res.status(200).json(user);

  } catch (err) {
    console.error("❌ ME ERROR:", err);
    return res.status(500).json({ message: "Server error fetching user" });
  }
});

/* ---------------------------
   UPDATE PROFILE
---------------------------- */
router.put("/update-profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const updateData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      location: req.body.location,

      workingHours:
        typeof req.body.workingHours === "string" &&
        req.body.workingHours.includes("-")
          ? {
              start: req.body.workingHours.split("-")[0].trim(),
              end: req.body.workingHours.split("-")[1].trim()
            }
          : req.body.workingHours,

      experience: req.body.experience,
      patience: req.body.patience,
      hourlyRate: req.body.hourlyRate,
      activities: req.body.activities,
      languages: req.body.languages,
      profileImage: req.body.profileImage
    };

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ PROFILE UPDATED:", updatedUser._id);

    return res.status(200).json(updatedUser);

  } catch (err) {
    console.error("❌ UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error updating profile" });
  }
});

/* ---------------------------
   DELETE PROFILE
---------------------------- */
router.delete("/delete-profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("🗑️ PROFILE DELETED:", userId);

    return res.status(200).json({
      message: "Profile deleted successfully"
    });

  } catch (err) {
    console.error("❌ DELETE PROFILE ERROR:", err);
    return res.status(500).json({ message: "Server error deleting profile" });
  }
});

export default router;