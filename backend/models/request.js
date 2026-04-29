import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    elderly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    caregiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending"
    },

    serviceNumber: {
      type: Number,
      required: true
    },

    requestDate: {
      type: String,
      required: true
    },

    requestTime: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);