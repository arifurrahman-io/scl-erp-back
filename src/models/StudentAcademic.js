const mongoose = require("mongoose");

const StudentAcademicSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
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
    roll: { type: Number, required: true },
    group: {
      type: String,
      enum: ["General", "Science", "Commerce", "Arts"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["Active", "Dropped", "Passed"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Ensure unique roll per class/section/year
StudentAcademicSchema.index(
  { academicYear: 1, class: 1, section: 1, roll: 1 },
  { unique: true }
);

module.exports = mongoose.model("StudentAcademic", StudentAcademicSchema);
