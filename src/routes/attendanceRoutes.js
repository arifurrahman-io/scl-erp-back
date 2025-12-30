// backend/src/routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Protect all routes to ensure only authenticated users can access
router.use(protect);

router.get(
  "/check",
  restrictTo("TEACHER", "CLASS_TEACHER", "SUPER_ADMIN", "ADMIN"),
  attendanceController.checkAttendance
);

// POST /api/attendance/submit
router.post(
  "/submit",
  restrictTo("TEACHER", "CLASS_TEACHER", "SUPER_ADMIN", "ADMIN"),
  attendanceController.submitAttendance
);

// GET /api/attendance/history (Optional: for viewing past logs) [cite: 2025-10-11]
router.get(
  "/history",
  restrictTo("TEACHER", "CLASS_TEACHER", "SUPER_ADMIN", "ADMIN"),
  attendanceController.getAttendanceHistory
);

module.exports = router;
