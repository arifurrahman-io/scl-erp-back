const express = require("express");
const router = express.Router();
const {
  registerStudent,
  getStudentsByFilters,
  getStudentProfile,
  getStudentById,
  updateStudent,
  getStudentsForAttendance,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { checkCampusAccess } = require("../middleware/campusMiddleware");

router.use(protect);

// --- 1. ATTENDANCE & LISTS (Static Routes First) ---
// This must be ABOVE /:id so "list" isn't treated as an ID
router.get("/list", getStudentsForAttendance);

// --- 2. REGISTRATION (Create) ---
router.post(
  "/:campusId/register",
  authorize("SUPER_ADMIN", "ADMIN"),
  checkCampusAccess,
  registerStudent
);

// --- 3. DIRECTORY & LISTING ---
router.get("/", getStudentsByFilters);

// --- 4. PROFILE MANAGEMENT (Dynamic Routes Last) ---
// Fetch by custom Student ID (BAN-2025-001)
router.get("/profile/:studentId", getStudentProfile);

// Fetch by MongoDB _id
// If this was above /list, GET /students/list would try to find a student with ID "list"
router.get("/:id", getStudentById);

// Update student record
router.put("/:id", authorize("SUPER_ADMIN", "ADMIN"), updateStudent);

module.exports = router;
