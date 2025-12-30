const mongoose = require("mongoose");

const RoutineSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    // Identifies if this user is the primary guardian/lead for this specific section
    isClassTeacher: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensuring data integrity:
// 1. A section can only have one specific subject-teacher assignment per session
RoutineSchema.index(
  { academicYear: 1, campus: 1, class: 1, section: 1, subject: 1 },
  { unique: true }
);

// 2. A teacher can only be assigned as the "Class Teacher" for one section per campus
RoutineSchema.index(
  { academicYear: 1, campus: 1, teacher: 1, isClassTeacher: 1 },
  { unique: true, partialFilterExpression: { isClassTeacher: true } }
);

module.exports = mongoose.model("Routine", RoutineSchema);
