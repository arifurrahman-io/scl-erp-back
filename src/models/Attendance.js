const mongoose = require("mongoose"); // Add this line

const AttendanceSchema = new mongoose.Schema({
  academicYear: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late"],
    default: "Present",
  },
  takenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Attendance", AttendanceSchema); // Add this line
