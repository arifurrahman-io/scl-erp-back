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
  getMasterStructure, // New Controller Method
  createSection,
  getSectionsByCampus,
  deleteSection,
} = require("../controllers/setupController");

// Global Protection
router.use(protect);

// --- NEW: Dynamic Master Structure (Used by Teacher Management/Attendance) ---
// This handles the URL: /api/settings/master-structure
router.get("/master-structure", getMasterStructure);

// --- Admin Only Routes ---
router.use(admin);

// Blueprint Management
router.post("/master-classes", createMasterClass);
router.get("/master-classes", getMasterClasses);
router.post("/master-subjects", createMasterSubject);

// Deployment Logic
router.post("/deploy", deployToCampus);

// Campus-specific views
router.get("/classes/:campusId", getClassesByCampus);
router.get("/subjects/:classId", getSubjectsByClass);

// Subject & Class Management
router.put("/subjects/:id", updateMasterSubject);
router.delete("/subjects/:id", deleteMasterSubject);
router.delete("/classes/:id", deleteCampusClass);

// --- SECTION MANAGEMENT ---
router.post("/sections", protect, admin, createSection);
router.get("/sections/:campusId", protect, getSectionsByCampus);
router.delete("/sections/:id", protect, admin, deleteSection);

module.exports = router;
