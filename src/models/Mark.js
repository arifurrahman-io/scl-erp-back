// src/models/Marks.js
const mongoose = require("mongoose");

const MarksSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    term: {
      type: String,
      enum: ["Half-Yearly", "Annual", "Pre-Test", "Test"],
      required: true,
    },
    obtainedMarks: { type: Number, required: true, min: 0, max: 100 },
    passingMarks: { type: Number, default: 33 },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Marks", MarksSchema);
