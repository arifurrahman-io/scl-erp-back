const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// 1. BASE PROTECTION
// Every user must be logged in to access any user-related data
router.use(protect);

// 2. ACADEMIC & DIRECTORY ACCESS (Read-Only)
// These routes allow Teachers and Admins to fetch the directory for scheduling,
// routine purposes, and viewing profiles.
// This specifically fixes the 403 error on the "My Routine" page.

// Get full staff list (Academic/Administrative groups)
router.get(
  "/",
  restrictTo("SUPER_ADMIN", "ADMIN", "TEACHER", "CLASS_TEACHER"),
  userController.getUsers
);

// Specifically for fetching academic groups in routines
router.get(
  "/group",
  restrictTo("SUPER_ADMIN", "ADMIN", "TEACHER", "CLASS_TEACHER"),
  userController.getUsersByGroup
);

// Get specific staff member by DB ID (Used for profile hydration)
router.get(
  "/:id",
  restrictTo("SUPER_ADMIN", "ADMIN", "TEACHER", "CLASS_TEACHER"),
  userController.getStudentById // <--- Check if this name matches the controller!
);

// 3. ADMINISTRATIVE LOCKDOWN (Write Operations)
// Any route defined after this line requires SUPER_ADMIN privileges.
router.use(restrictTo("SUPER_ADMIN"));

// Register new staff
router.post("/register", userController.registerUser);

// Update or Delete staff record
router
  .route("/:id")
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
