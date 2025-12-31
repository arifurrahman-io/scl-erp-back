const express = require("express");
const router = express.Router();

// Route Imports
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const studentRoutes = require("./studentRoutes");
const academicRoutes = require("./academicRoutes");
const financeRoutes = require("./financeRoutes");
const reportRoutes = require("./reportRoutes");
const campusRoutes = require("./campusRoutes");
const setupRoutes = require("./setupRoutes");
const routineRoutes = require("./routineRoutes");
const attendanceRouter = require("./attendanceRoutes");
const teacherRouter = require("./teacherRoutes");

// 1. Authentication & System Users
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// 2. Core Academic & Student Modules
router.use("/students", studentRoutes);

// This handles: /api/academics/years AND /api/academics/marks/submit
// It aligns with your ENDPOINTS: ACADEMICS: { MARKS: "/exams/marks" }
router.use("/academics", academicRoutes);
router.use("/exams", academicRoutes); // Aliasing /exams to academicRoutes for MarksEntry

// 3. Finance & Reporting
router.use("/finance", financeRoutes);
router.use("/dashboard", reportRoutes);

// 4. Infrastructure & Configuration
router.use("/campuses", campusRoutes);
router.use("/setup", setupRoutes);
router.use("/settings", setupRoutes); // Campus-specific structure
router.use("/routine", routineRoutes);
router.use("/attendance", attendanceRouter);
router.use("/teacher", teacherRouter);

module.exports = router;
