const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    passMarks: { type: Number, default: 40 },
    distribution: {
      // Core Categories
      subjective: { type: Number, default: 0 },
      objective: { type: Number, default: 0 },
      practical: { type: Number, default: 0 },

      // Added Categories for continuous assessment
      ct: { type: Number, default: 0 }, // Class Test Marks
      diary: { type: Number, default: 0 }, // Diary/Behavior Marks
      assignment: { type: Number, default: 0 }, // Assignment/Project Marks
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
