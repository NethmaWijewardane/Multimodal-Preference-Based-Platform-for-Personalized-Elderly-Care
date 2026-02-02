import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["elderly", "caregiver"], required: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
  location: String,
  languages: [String],
  activities: [String],
  experience: Number,
  patience: Number,
  hourlyRate: Number
}, { timestamps: true });

export default mongoose.model("User", userSchema);
