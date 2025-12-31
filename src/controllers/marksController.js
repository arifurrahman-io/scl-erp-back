// backend/src/controllers/marksController.js
const Mark = require("../models/Mark"); // Must match your singular file name
const catchAsync = require("../utils/catchAsync");

// Export must be a function
exports.submitMarks = catchAsync(async (req, res) => {
  const {
    academicYear,
    campus,
    class: classId,
    section: sectionId,
    subject: subjectId,
    data,
    term,
  } = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ message: "No marks data provided." });
  }

  const bulkOps = Object.entries(data).map(([studentId, scores]) => {
    // Calculate total for obtainedMarks field
    const total = Object.values(scores).reduce(
      (acc, val) => acc + (parseFloat(val) || 0),
      0
    );

    return {
      updateOne: {
        filter: {
          academicYear,
          studentId,
          subjectId,
          term: term || "CT",
        },
        update: {
          classId,
          sectionId,
          campusId: campus, // Maps campus to campusId in your model
          distributionMarks: scores, // Map for dynamic categories [cite: 2025-10-11]
          obtainedMarks: total,
          teacherId: req.user._id,
          passingMarks: 33,
        },
        upsert: true,
      },
    };
  });

  await Mark.bulkWrite(bulkOps);
  res.status(200).json({ status: "success", message: "Marks Published" });
});

// Placeholder to prevent TypeError on line 33 if referenced
exports.getMarksHistory = catchAsync(async (req, res) => {
  res.status(200).json({ status: "success", data: [] });
});

// Fetch marks for a specific scope to view/edit
exports.getMarksByScope = catchAsync(async (req, res) => {
  const {
    academicYear,
    campus,
    class: classId,
    section,
    subject,
    term,
  } = req.query;

  const existingMarks = await Mark.find({
    academicYear,
    campusId: campus,
    classId,
    sectionId: section,
    subjectId: subject,
    term: term || "CT",
  });

  // Transform array into an object mapping: { studentId: distributionMarks }
  const marksMap = {};
  existingMarks.forEach((m) => {
    marksMap[m.studentId] = m.distributionMarks;
  });

  res.status(200).json({
    status: "success",
    data: marksMap,
  });
});
