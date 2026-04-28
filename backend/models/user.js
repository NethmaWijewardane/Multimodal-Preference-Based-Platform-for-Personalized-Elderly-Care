import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["elderly", "caregiver"], required: true },

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  location: { type: String, default: "" },
  languages: { type: [String], default: [] },
  activities: { type: [String], default: [] },

  // caregiver-only fields (optional)
  experience: { type: Number, default: 0 },
  patience: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 }

}, { timestamps: true });

export default mongoose.model("User", userSchema);