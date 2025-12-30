const mongoose = require("mongoose");

const AcademicYearSchema = new mongoose.Schema(
  {
    year: { type: String, required: true, unique: true }, // e.g., "2025-26"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive", "Active", "Inactive"], // Added both cases to be safe
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicYear", AcademicYearSchema);
