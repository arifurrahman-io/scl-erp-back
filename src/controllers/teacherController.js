// backend/src/controllers/teacherController.js
const Routine = require("../models/Routine");
const catchAsync = require("../utils/catchAsync");

exports.getDashboardSummary = catchAsync(async (req, res) => {
  const { academicYearId, campusId } = req.query;
  const teacherId = req.user._id;

  // 1. Fetch all mappings for this specific teacher
  const assignments = await Routine.find({
    teacher: teacherId,
    academicYear: academicYearId,
    campus: campusId,
  });

  // 2. Generate stats for the "Attractive UI" [cite: 2025-10-11]
  const totalSubjects = assignments.length;
  const uniqueSections = [
    ...new Set(assignments.map((a) => a.section.toString())),
  ].length;
  const isClassTeacher = assignments.some((a) => a.isClassTeacher);

  res.status(200).json({
    status: "success",
    data: {
      totalSubjects,
      totalSections: uniqueSections,
      isClassTeacher,
      assignments: assignments.length > 0 ? assignments : [],
    },
  });
});
