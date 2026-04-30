import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ["elderly", "caregiver"], 
    required: true 
  },

  name: { 
    type: String, 
    required: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  password: { 
    type: String, 
    required: true 
  },

  location: { 
    type: String, 
    default: "" 
  },

  languages: { 
    type: [String], 
    default: [] 
  },

  activities: { 
    type: [String], 
    default: [] 
  },

  experience: { 
    type: Number, 
    default: 0 
  },

  patience: { 
    type: Number, 
    default: 0 
  },

  hourlyRate: { 
    type: Number, 
    default: 0 
  },

  phone: {
    type: String,
    default: "",
    validate: {
      validator: function (v) {
        if (!v) return true; 
        return /^0\d{9}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number. Must start with 0 and be 10 digits.`,
    },
  },

  workingHours: {
    start: { type: String, default: "" },
    end: { type: String, default: "" },
  },

  profileImage: { 
    type: String, 
    default: null 
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);