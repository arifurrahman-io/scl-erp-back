const express = require("express");
const router = express.Router();

// Ensure these names match EXACTLY what is exported in academicController.js
const {
  getAcademicYears,
  getActiveYear,
} = require("../controllers/academicController");

// If getAcademicYears is undefined, the line below throws the TypeError
router.get("/years", getAcademicYears);
router.get("/active-year", getActiveYear);

module.exports = router;
