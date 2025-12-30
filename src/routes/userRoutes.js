const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

/**
 * 1. GLOBAL MIDDLEWARE
 * All staff management operations are strictly gated.
 * 'protect' verifies the JWT and 'restrictTo' verifies the role.
 * Order is critical: 'protect' must run before 'restrictTo'.
 */
router.use(protect); //
router.use(restrictTo("SUPER_ADMIN")); //

/**
 * 2. STAFF DIRECTORY (READ)
 * Fetches all users or filtered by ?roleGroup=ADMINISTRATIVE|ACADEMIC.
 * Matches: GET /api/users
 */
router.get("/", userController.getUsers); //

/**
 * 3. USER REGISTRATION (CREATE)
 * Super Admin creates new staff accounts.
 * Matches: POST /api/users/register
 */
router.post("/register", userController.registerUser); //

/**
 * 4. USER MANAGEMENT (UPDATE & DELETE)
 * Grouped by ID for cleaner RESTful structure.
 * Matches: PUT /api/users/:id and DELETE /api/users/:id
 */
router
  .route("/:id")
  .put(userController.updateUser) //
  .delete(userController.deleteUser); //

module.exports = router;
