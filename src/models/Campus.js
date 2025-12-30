const mongoose = require("mongoose");

const CampusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Main Campus", "Dhanmondi Branch"
    location: { type: String },
    contactPerson: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Campus", CampusSchema);
