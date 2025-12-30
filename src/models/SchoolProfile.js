const mongoose = require("mongoose");

const SchoolProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String }, // URL to Cloudinary/S3
    address: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String },
    phone: { type: String },
    establishedYear: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchoolProfile", SchoolProfileSchema);
