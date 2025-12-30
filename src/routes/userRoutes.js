const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// 1. GLOBAL MIDDLEWARE
// Only SUPER_ADMIN can manage staff accounts (Admins, Teachers, Accountants)
router.use(protect);
router.use(restrictTo("SUPER_ADMIN"));

// 2. STAFF DIRECTORY & REGISTRATION
router.get("/", userController.getUsers);
router.post("/register", userController.registerUser);

// 3. USER MANAGEMENT (UPDATE & DELETE)
router
  .route("/:id")
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
