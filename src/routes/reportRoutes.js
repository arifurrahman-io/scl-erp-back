const express = require("express");
const router = express.Router();
const { getSuperAdminStats } = require("../controllers/reportController");
const { protect, admin } = require("../middleware/authMiddleware");

// Ensure the path matches your frontend request: /api/dashboard/super-admin-stats
router.get("/super-admin-stats", protect, admin, getSuperAdminStats);

module.exports = router;
