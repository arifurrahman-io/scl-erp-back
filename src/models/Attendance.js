// backend/src/models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campus",
    required: true,
  },
  class: { type: String, required: true }, // Matches "Four"
  section: { type: String, required: true }, // Matches "A"
  records: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      status: { type: String, enum: ["Present", "Absent"], default: "Present" },
    },
  ],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastUpdated: { type: Date, default: Date.now },
});

// Prevent duplicate attendance for the same class/section on the same day
attendanceSchema.index(
  { date: 1, campus: 1, class: 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
