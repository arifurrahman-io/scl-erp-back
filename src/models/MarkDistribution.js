// backend/src/models/MarkDistribution.js
const mongoose = require("mongoose");

const markDistributionSchema = new mongoose.Schema({
  class: { type: String, required: true }, // Matches "Four"
  subject: { type: String, required: true },
  categories: [
    {
      name: { type: String, required: true }, // e.g., "CT", "Written"
      max: { type: Number, required: true }, // e.g., 20, 80
    },
  ],
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear" },
  lastUpdated: { type: Date, default: Date.now },
});

// Index for fast lookups during Marks Entry
markDistributionSchema.index({ class: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("MarkDistribution", markDistributionSchema);
