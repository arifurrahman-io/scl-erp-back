const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    // The student making the payment
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    // Year-specific tracking
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    // Campus scoping
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Monthly Tuition",
        "Session Fee",
        "IT Fee",
        "ID Card",
        "Fine",
        "Other",
      ],
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Mobile Banking", "Cheque"],
      default: "Cash",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allows nulls to be unique for cash transactions
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // The Accountant or Admin who processed the payment
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexing for faster report generation (Defaulter and Paid lists)
PaymentSchema.index({ student: 1, academicYear: 1, campus: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);
