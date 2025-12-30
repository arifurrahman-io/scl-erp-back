const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    campus: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    roll: { type: String, required: true },
    group: {
      type: String,
      required: false,
      enum: ["Science", "Commerce", "Humanities", null, ""], // Added Humanities
      default: null,
    },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female"] },
    bloodGroup: { type: String },
    birthRegNumber: { type: String },
    fatherName: { type: String },
    fatherNid: { type: String },
    motherName: { type: String },
    motherNid: { type: String },
    presentAddress: { type: String },
    homeDistrict: { type: String },
    photo: { type: String },
  },
  { timestamps: true }
);

// Add an index to prevent duplicate Roll numbers in the same Class, Section, and Year
StudentSchema.index(
  { campus: 1, class: 1, section: 1, roll: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model("Student", StudentSchema);
