const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", SectionSchema);
