import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    specialization: {
      type: String,
      required: true
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },

    experience: {
      type: Number // years
    },

    education: {
      type: String
    },

    address: {
      type: String
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    image: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

const Doctor = mongoose.model("Doctor", doctorSchema);
 
export default Doctor;