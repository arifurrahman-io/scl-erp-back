// backend/src/routes/academicRoutes.js
const express = require("express");
const router = express.Router();

// Import controllers
const academicController = require("../controllers/academicController");
const marksController = require("../controllers/marksController"); // New Controller
const { protect, restrictTo } = require("../middleware/authMiddleware");

// --- 1. Public/Authenticated Read Access ---
router.get("/years", academicController.getAcademicYears);
router.get("/active-year", academicController.getActiveYear);

// --- 2. Secured Academic Operations ---
// Every route below this requires a logged-in user [cite: 2025-10-11]
router.use(protect);

/**
 * @desc    Submit category-wise marks for a class section
 * @route   POST /api/exams/marks/submit
 * @access  Private (Teacher, Class Teacher, Admin)
 */
router.post(
  "/marks/submit",
  restrictTo("TEACHER", "CLASS_TEACHER", "ADMIN", "SUPER_ADMIN"),
  marksController.submitMarks
);

// Add this line above your submit route
router.get(
  "/marks/fetch",
  restrictTo("TEACHER", "CLASS_TEACHER", "ADMIN", "SUPER_ADMIN"),
  marksController.getMarksByScope
);

/**
 * @desc    Get marks history for a specific student/subject
 * @route   GET /api/exams/marks/history
 */
router.get(
  "/marks/history",
  restrictTo("TEACHER", "CLASS_TEACHER", "SUPER_ADMIN", "ADMIN"),
  marksController.getMarksHistory
);

module.exports = router;
