const express = require("express");
const router = express.Router();
const routineController = require("../controllers/routineController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// 1. BASE PROTECTION
// Every user must be logged in to interact with any routine data
router.use(protect);

router.get("/my-scopes", routineController.getMyScopes);

// 2. DEFINE ALLOWED ROLES
// Defining all roles from your system to keep the code clean
const ALL_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "TEACHER",
  "CLASS_TEACHER",
  "ACCOUNTANT",
];

// 3. FULL CRUD ACCESS FOR ALL ROLES
// This fixes the 403 error for teachers and class teachers

// READ: View routines
router.get("/", restrictTo(...ALL_ROLES), routineController.getRoutine);

// CREATE: Add new routine entries
router.post(
  "/create",
  restrictTo(...ALL_ROLES),
  routineController.createRoutine
);

// UPDATE & DELETE: Modify existing entries by ID
router
  .route("/:id")
  .put(restrictTo(...ALL_ROLES), routineController.updateRoutine)
  .delete(restrictTo(...ALL_ROLES), routineController.deleteRoutine);

module.exports = router;
