const express = require("express");
const router = express.Router();
const routineController = require("../controllers/routineController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

/**
 * 1. TEACHER & STAFF VIEW ROUTES
 * These endpoints allow staff to see their own assignments.
 * 'protect' ensures the user is logged in.
 */
router.get(
  "/my-routine",
  protect,
  restrictTo("TEACHER", "CLASS_TEACHER", "ADMIN", "SUPER_ADMIN"),
  routineController.getMyRoutine
);

router.get(
  "/my-scopes",
  protect,
  restrictTo("TEACHER", "CLASS_TEACHER", "ADMIN", "SUPER_ADMIN"),
  routineController.getAssignedScopes
);

/**
 * 2. ADMINISTRATIVE & SCHEDULING ROUTES
 * Gates all following routes to high-level staff only.
 */
router.use(protect, restrictTo("SUPER_ADMIN", "ADMIN"));

// Get full routine for a specific campus/class (Admin Dashboard View)
// Moved above /:id to prevent route parameter collision
router.get("/admin/view", routineController.getAdminRoutineView);

// Create a new routine entry
router.post("/", routineController.createRoutine);

// Bulk operations (Useful for setting up a whole class at once)
router.put(
  "/bulk-update",
  routineController.bulkUpdateRoutine ||
    ((req, res) => res.status(501).json({ message: "Not implemented yet" }))
);

/**
 * 3. SPECIFIC ASSIGNMENT MANAGEMENT
 */
router.route("/:id").delete(routineController.deleteRoutine);

module.exports = router;
