const StudentAcademic = require("../models/StudentAcademic");
const Payment = require("../models/Payment");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.getSuperAdminStats = async (req, res) => {
  try {
    let { academicYearId, campusId } = req.query;

    // Standardize IDs to prevent array/string mismatch
    const cleanYearId = Array.isArray(academicYearId)
      ? academicYearId[0]
      : academicYearId;
    const cleanCampusId = Array.isArray(campusId) ? campusId[0] : campusId;

    if (!cleanYearId || !cleanCampusId || cleanYearId === "undefined") {
      return res
        .status(400)
        .json({ message: "Academic Year and Campus required" });
    }

    const yearId = new mongoose.Types.ObjectId(cleanYearId);
    const cId = new mongoose.Types.ObjectId(cleanCampusId);

    const [totalStudents, totalStaff, revenueData] = await Promise.all([
      // Count students specific to campus and year
      StudentAcademic.countDocuments({ academicYear: yearId, campus: cId }),

      // Count staff assigned to this campus
      User.countDocuments({
        role: { $in: ["TEACHER", "CLASS_TEACHER"] },
        assignedCampuses: cId,
      }),

      // Calculate revenue for this selection
      Payment.aggregate([
        { $match: { academicYear: yearId, campus: cId, status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    res.status(200).json({
      totalStudents,
      totalStaff,
      totalRevenue: revenueData[0]?.total || 0,
      // Flat attendance object to avoid [object Object] in UI
      attendance: {
        present: 0, // Replace with actual aggregation when ready
        absent: 0,
        late: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error", error: error.message });
  }
};
