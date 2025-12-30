const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const studentRoutes = require("./studentRoutes");
const academicRoutes = require("./academicRoutes");
const financeRoutes = require("./financeRoutes");
const reportRoutes = require("./reportRoutes");
const campusRoutes = require("./campusRoutes");
const setupRoutes = require("./setupRoutes");
const routineRoutes = require("./routineRoutes");

// 1. Authentication & System Users
router.use("/auth", authRoutes);
router.use("/users", userRoutes); // Staff CRUD (Admins & Teachers)

// 2. Core Academic & Student Modules
router.use("/students", studentRoutes); // Directory & Registration
router.use("/academics", academicRoutes); // Global Sessions

// 3. Finance & Reporting
router.use("/finance", financeRoutes); // Collections & Fee Blueprints
router.use("/dashboard", reportRoutes); // Analytics for Stats Cards

// 4. Infrastructure & Configuration
router.use("/campuses", campusRoutes); // Branch Data & School Profile
router.use("/setup", setupRoutes); // Master Class/Subject Blueprints
router.use("/routine", routineRoutes);
router.use("/settings", setupRoutes);

module.exports = router;
