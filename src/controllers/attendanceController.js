// backend/src/controllers/attendanceController.js
const Attendance = require("../models/Attendance");
const catchAsync = require("../utils/catchAsync");

/**
 * @desc    Submit or Update daily attendance logs
 * @route   POST /api/attendance/submit
 * @access  Private (Teacher/Admin)
 */
exports.submitAttendance = catchAsync(async (req, res) => {
  const { date, campus, class: className, section, records } = req.body;

  // 1. Validation for essential fields
  if (!date || !campus || !className || !section || !records) {
    return res.status(400).json({
      status: "fail",
      message:
        "Incomplete data. Please ensure campus, class, section, and records are provided.",
    });
  }

  // 2. Atomic Upsert Logic [cite: 2025-10-11]
  // Matches "Four" and "A" labels exactly as stored in your Student records
  const attendance = await Attendance.findOneAndUpdate(
    {
      date, // YYYY-MM-DD string
      campus,
      class: className,
      section,
    },
    {
      records, // Array of { student: ID, status: "Present"/"Absent" }
      submittedBy: req.user._id,
      lastUpdated: Date.now(),
    },
    {
      upsert: true, // Creates a new record if one doesn't exist for this date/class/section [cite: 2025-10-11]
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Attendance synced successfully.",
    data: attendance,
  });
});

/**
 * @desc    Get recent attendance logs for a specific section
 * @route   GET /api/attendance/history
 */
exports.getAttendanceHistory = catchAsync(async (req, res) => {
  const { campus, class: className, section } = req.query;

  // Build dynamic filter based on query params [cite: 2025-10-11]
  const filter = {};
  if (campus) filter.campus = campus;
  if (className) filter.class = className;
  if (section) filter.section = section;

  const history = await Attendance.find(filter)
    .populate("submittedBy", "name") // Show which teacher took the attendance
    .sort({ date: -1 })
    .limit(30)
    .lean();

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history,
  });
});

exports.checkAttendance = catchAsync(async (req, res) => {
  const { date, class: className, section, campus } = req.query;

  // Find record matching the exact string labels from your DB
  const record = await Attendance.findOne({
    date, // "2025-12-30"
    class: className, // "Four"
    section: section, // "A"
    campus: campus, // "69541c46..."
  }).lean();

  res.status(200).json({
    status: "success",
    exists: !!record,
    data: record || null,
  });
});
