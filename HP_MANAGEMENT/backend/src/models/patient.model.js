import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    patientId: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    dateOfBirth: {
        type: Date,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    medicalHistory: {
        type: [String],
        default: [],
    },
    contactNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true,
    },
    emergencyContact: {
        name: {
            type: String,
        },
        emergencyPhone: {
            type: Number,
        },
    },

}, { timestamps: true });

patientSchema.pre("save", async function () {
  // Always generate patientId if not present
  if (!this.patientId) {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.patientId = `PAT-${random}`;
  }
});



const Patient = mongoose.model("Patient", patientSchema);

export default Patient;