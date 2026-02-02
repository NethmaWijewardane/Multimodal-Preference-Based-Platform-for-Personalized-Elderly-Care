import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  caregiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: Number,
  feedback: String
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);
