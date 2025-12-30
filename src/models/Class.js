const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    isMaster: { type: Boolean, default: false }, // Blueprint flag
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus" }, // Null for Global Templates
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
