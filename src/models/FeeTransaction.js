const mongoose = require("mongoose");

const FeeTransactionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentId: { type: String, required: true }, // e.g., "BAN-2025-26-01"
    campus: { type: String, required: true }, // e.g., "Banasree-Day"
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    // Array to store multiple fees paid in one transaction
    items: [
      {
        feeName: String,
        amount: Number,
        feeMasterId: { type: mongoose.Schema.Types.ObjectId, ref: "FeeMaster" },
      },
    ],

    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "bKash", "Bank"],
      default: "Cash",
    },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // The accountant
    receiptNo: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeTransaction", FeeTransactionSchema);
