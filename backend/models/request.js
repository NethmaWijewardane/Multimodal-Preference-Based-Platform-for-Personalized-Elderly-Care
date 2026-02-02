import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  elderly: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  caregiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "pending" }
}, { timestamps: true });

export default mongoose.model("Request", requestSchema);
