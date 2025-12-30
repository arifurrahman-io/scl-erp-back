const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createMasterClass,
  getMasterClasses,
  createMasterSubject,
  deployToCampus,
  getClassesByCampus,
  updateMasterSubject,
  deleteMasterSubject,
  getSubjectsByClass,
  deleteCampusClass,
  getMasterStructure,
  createSection,
  getSectionsByCampus,
  deleteSection,
} = require("../controllers/setupController");

// 1. GLOBAL PROTECTION
// Every user must be authenticated to access setup data
router.use(protect);

// 2. PUBLIC ACADEMIC ACCESS (Read-Only)
// These routes must be accessible to TEACHERS and CLASS_TEACHERS
// so they can load dropdowns for Routines, Attendance, and Marks.

// Used by Teacher Management/Attendance
router.get("/master-structure", getMasterStructure);

// Fetch classes and sections for a specific campus
router.get("/classes/:campusId", getClassesByCampus);
router.get("/sections/:campusId", getSectionsByCampus);

// Fetch subjects for a specific class
// This fixes the 403 error on "GET /api/setup/subjects/:classId"
router.get("/subjects/:classId", getSubjectsByClass);

// 3. ADMINISTRATIVE LOCKDOWN (Write Operations)
// Any route below this line requires Admin/Super Admin privileges.
router.use(admin);

// Blueprint Management
router.post("/master-classes", createMasterClass);
router.get("/master-classes", getMasterClasses);
router.post("/master-subjects", createMasterSubject);

// Deployment Logic
router.post("/deploy", deployToCampus);

// Subject & Class Management
router.put("/subjects/:id", updateMasterSubject);
router.delete("/subjects/:id", deleteMasterSubject);
router.delete("/classes/:id", deleteCampusClass);

// Section Management (Write Actions)
router.post("/sections", createSection);
router.delete("/sections/:id", deleteSection);

module.exports = router;
