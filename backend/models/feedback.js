import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    elderly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Feedback", feedbackSchema);