// src/routes/campusRoutes.js
const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getCampuses,
  createCampus,
  updateCampus,
  deleteCampus,
  getSchoolProfile,
  updateSchoolProfile,
  setupAcademicYear,
  getAcademicYears,
  getActiveYear,
  setCurrentYear, // <--- ADD THIS LINE
} = require("../controllers/campusController");

// 1. Static/Specific Routes FIRST
router.route("/").get(protect, getCampuses).post(protect, admin, createCampus);

// Branding & Academic Setup
router
  .route("/school-profile")
  .get(getSchoolProfile)
  .put(protect, admin, updateSchoolProfile);

// Academic Year Management
router.get("/academic-years", protect, getAcademicYears);
router.get("/active-year", protect, getActiveYear);
router.post("/academic-year", protect, admin, setupAcademicYear);

// Now this line will work correctly because setCurrentYear is imported
router.patch("/academic-years/set-current/:id", protect, admin, setCurrentYear);

// 2. Dynamic/ID-based Routes LAST
router
  .route("/:id")
  .put(protect, admin, updateCampus)
  .delete(protect, admin, deleteCampus);

module.exports = router;
