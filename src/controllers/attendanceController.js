// backend/src/controllers/attendanceController.js
const Attendance = require("../models/Attendance");
const catchAsync = require("../utils/catchAsync");

/**
 * @desc    Submit or Update daily attendance logs
 * @route   POST /api/attendance/submit
 */
exports.submitAttendance = catchAsync(async (req, res) => {
  const { date, campus, class: className, section, records } = req.body;

  if (!date || !campus || !className || !section || !records) {
    return res.status(400).json({
      status: "fail",
      message:
        "Incomplete data. Campus, class, section, and records are required.",
    });
  }

  // Atomic Upsert: Updates if exists, creates if not [cite: 2025-10-11]
  const attendance = await Attendance.findOneAndUpdate(
    { date, campus, class: className, section },
    {
      records, // Array of { student: ID, status: "Present"/"Absent" }
      submittedBy: req.user._id,
      lastUpdated: Date.now(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    message: "Attendance synced successfully.",
    data: attendance,
  });
});

/**
 * @desc    Check for existing attendance and return records for UI mapping
 * @route   GET /api/attendance/check
 */
exports.checkAttendance = catchAsync(async (req, res) => {
  const { date, class: className, section, campus } = req.query;

  // Validation to prevent "Sync error" on incomplete requests
  if (!date || !className || !section || !campus) {
    return res.status(200).json({ exists: false, records: [] });
  }

  const record = await Attendance.findOne({
    date,
    class: className,
    section: section,
    campus: campus,
  }).lean();

  // IMPORTANT: Matches the 'res.data.records' expectation in your frontend
  res.status(200).json({
    status: "success",
    exists: !!record,
    records: record ? record.records : [], // Returns the nested records array directly
  });
});

/**
 * @desc    Get attendance history with teacher population
 * @route   GET /api/attendance/history
 */
exports.getAttendanceHistory = catchAsync(async (req, res) => {
  const { campus, class: className, section } = req.query;

  const filter = {};
  if (campus) filter.campus = campus;
  if (className) filter.class = className;
  if (section) filter.section = section;

  const history = await Attendance.find(filter)
    .populate("submittedBy", "name") // UI displays which teacher took attendance [cite: 2025-10-11]
    .sort({ date: -1 })
    .limit(30)
    .lean();

  res.status(200).json({
    status: "success",
    results: history.length,
    data: history,
  });
});
