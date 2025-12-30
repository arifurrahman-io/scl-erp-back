const StudentAcademic = require("../models/StudentAcademic");
const Payment = require("../models/Payment");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Get aggregate stats for Super Admin view
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
        present: 0,
        absent: 0,
        late: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Dashboard error", error: error.message });
  }
};

// @desc    Get specific class/section stats for the logged-in Class Teacher
exports.getTeacherDashboardSummary = async (req, res) => {
  try {
    const { academicYearId, campusId } = req.query;
    const teacherId = req.user.id; // From authMiddleware

    // 1. Standardize IDs for consistency and safety
    const cleanYearId = Array.isArray(academicYearId)
      ? academicYearId[0]
      : academicYearId;
    const cleanCampusId = Array.isArray(campusId) ? campusId[0] : campusId;

    // 2. Fetch Teacher with populated assignment names for the UI
    const teacher = await User.findById(teacherId)
      .populate("classTeacherOf.class", "name")
      .populate("classTeacherOf.section", "name");

    if (!teacher || teacher.role !== "CLASS_TEACHER") {
      return res
        .status(403)
        .json({ message: "Access restricted to Class Teachers" });
    }

    const myClass = teacher.classTeacherOf?.class;
    const mySection = teacher.classTeacherOf?.section;

    // 3. Fetch student count specifically for this teacher's lead assignment
    let studentCount = 0;
    if (myClass && mySection && cleanYearId && cleanCampusId) {
      studentCount = await StudentAcademic.countDocuments({
        campus: cleanCampusId,
        academicYear: cleanYearId,
        class: myClass._id,
        section: mySection._id,
      });
    }

    res.status(200).json({
      className: myClass?.name || "Not Assigned",
      sectionName: mySection?.name || "Not Assigned",
      totalStudents: studentCount,
      teacherName: teacher.name,
      // Metadata for dynamic UI components [cite: 2025-10-11]
      scope: {
        classId: myClass?._id,
        sectionId: mySection?._id,
      },
    });
  } catch (error) {
    console.error("TEACHER_DASHBOARD_ERROR:", error);
    res
      .status(500)
      .json({ message: "Teacher dashboard error", error: error.message });
  }
};
