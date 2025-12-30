const express = require("express");
const router = express.Router();
const {
  registerStudent,
  getStudentsByFilters,
  getStudentProfile,
  getStudentById,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { checkCampusAccess } = require("../middleware/campusMiddleware");

router.post(
  "/:campusId/register",
  protect,
  authorize("SUPER_ADMIN", "ADMIN"),
  checkCampusAccess,
  registerStudent
);

router.get("/", protect, getStudentsByFilters);
router.get("/:id", protect, getStudentById);
router.get("/profile/:studentId", protect, getStudentProfile);

module.exports = router;
