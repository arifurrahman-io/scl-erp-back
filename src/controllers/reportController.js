const StudentAcademic = require("../models/StudentAcademic");
const Payment = require("../models/Payment");
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

exports.getSuperAdminStats = async (req, res) => {
  try {
    const { academicYearId, campusId } = req.query;

    if (!academicYearId || !campusId) {
      return res
        .status(400)
        .json({ message: "Year and Campus IDs are required" });
    }

    // Convert string IDs to Mongoose ObjectIds for aggregation
    const yearId = new mongoose.Types.ObjectId(academicYearId);
    const cId = new mongoose.Types.ObjectId(campusId);

    // 1. Total Students in this selection
    const totalStudents = await StudentAcademic.countDocuments({
      academicYear: yearId,
      campus: cId,
    });

    // 2. Total Revenue (Payments) for this selection
    const revenueData = await Payment.aggregate([
      { $match: { academicYear: yearId, campus: cId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // 3. Attendance Today (Summary)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendanceStats = await Attendance.aggregate([
      { $match: { academicYear: yearId, date: { $gte: today } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalStudents,
      totalRevenue: revenueData[0]?.total || 0,
      attendance: attendanceStats,
      activeYearId: academicYearId,
      activeCampusId: campusId,
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error", error: error.message });
  }
};
