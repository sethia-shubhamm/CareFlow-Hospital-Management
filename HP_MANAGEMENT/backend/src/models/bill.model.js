import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment"
    },

    amount: {
      type: Number,
      required: true
    },

    description: {
      type: String
    },

    billType: {
      type: String,
      enum: ["Consultation", "Lab", "Procedure", "Medication", "Other"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid"],
      default: "Unpaid"
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Net Banking", "Insurance"]
    },

    paymentDate: {
      type: Date
    },

    dueDate: {
      type: Date
    },

  },
  { timestamps: true }
);

const Bill = mongoose.model("Bill", billSchema);

export default Bill;