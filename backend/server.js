import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

dotenv.config();

const app = express();

// ===============================
// ✅ CORS CONFIG
// ===============================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ===============================
// ✅ MIDDLEWARE
// ===============================
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ===============================
// ✅ DATABASE CONNECTION
// ===============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ===============================
// ✅ ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

// 🔥 FIXED ROUTE (IMPORTANT)
app.use("/api/feedback", feedbackRoutes);

// ===============================
// ✅ SERVER START
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);