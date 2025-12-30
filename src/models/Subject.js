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
    passMarks: { type: Number, default: 33 },
    distribution: {
      subjective: { type: Number, default: 0 },
      objective: { type: Number, default: 0 },
      practical: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
