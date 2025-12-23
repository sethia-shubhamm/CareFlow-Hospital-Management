import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    recordType: {
      type: String,
      enum: ["Consultation", "Lab Report", "Scan", "Discharge Summary", "X-Ray", "Prescription", "Surgery", "Other"],
      default: "Consultation"
    },

    diagnosis: {
      type: String,
      default: ""
    },

    treatment: {
      type: String,
      default: ""
    },

    prescription: {
      type: String,
      default: ""
    },

    notes: {
      type: String,
      default: ""
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileSize: String
      }
    ],

    visitDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);

export default MedicalRecord;
