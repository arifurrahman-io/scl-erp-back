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
    campusId: {
      // Added for multi-campus support [cite: 2025-10-11]
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    term: {
      type: String,
      // Matches the categories in your MarksEntry.jsx
      enum: [
        "Half-Yearly",
        "Annual",
        "Pre-Test",
        "Test",
        "CT",
        "Diary",
        "Assignment",
      ],
      required: true,
    },
    // UPDATED: Stores category-wise marks { subjective: 80, objective: 15 }
    distributionMarks: {
      type: Map,
      of: Number,
      default: {},
    },
    obtainedMarks: { type: Number, required: true, min: 0 }, // Total of the map
    passingMarks: { type: Number, default: 33 },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Prevent duplicate entries for the same student/subject/term in a session
MarksSchema.index(
  { academicYear: 1, studentId: 1, subjectId: 1, term: 1 },
  { unique: true }
);

module.exports = mongoose.model("Marks", MarksSchema);
