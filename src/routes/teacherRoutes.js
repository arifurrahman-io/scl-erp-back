// backend/src/routes/teacherRoutes.js
const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Ensure only authenticated teachers/admins can access
router.use(protect);

router.get(
  "/dashboard-summary",
  restrictTo("TEACHER", "CLASS_TEACHER", "SUPER_ADMIN", "ADMIN"),
  teacherController.getDashboardSummary
);

module.exports = router;
