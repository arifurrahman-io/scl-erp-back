const Routine = require("../models/Routine");
const catchAsync = require("../utils/catchAsync");

// @desc    Get all mappings (Teacher to Subject/Section)
// @route   GET /api/routine
exports.getRoutine = catchAsync(async (req, res) => {
  const { campusId, academicYearId } = req.query;
  const filter = {};

  // 1. Sanitize inputs to ignore "undefined" strings from frontend
  if (campusId && campusId !== "undefined") {
    filter.campus = campusId;
  }

  // Handle cases where multiple IDs or "undefined" are passed
  if (academicYearId && academicYearId !== "undefined") {
    // If the frontend sends an array or duplicate, take the last valid ID
    const yearId = Array.isArray(academicYearId)
      ? academicYearId.pop()
      : academicYearId;
    filter.academicYear = yearId;
  }

  // 2. CRITICAL: Remove .sort({ day: 1, startTime: 1 })
  const routines = await Routine.find(filter)
    .populate("teacher", "name")
    .populate("class", "name")
    .populate("section", "name")
    .populate("subject", "name")
    .sort({ createdAt: -1 }) // Sort by newest assignment instead
    .lean();

  res.status(200).json(routines);
});

// @desc    Create new assignment mapping
// @route   POST /api/routine/create
exports.createRoutine = catchAsync(async (req, res) => {
  const {
    teacher,
    campus,
    class: classId,
    section,
    subject,
    academicYear,
    isClassTeacher,
  } = req.body;

  // 1. Check if this Subject in this Section already has a teacher assigned
  const existingMapping = await Routine.findOne({
    academicYear,
    campus,
    class: classId,
    section,
    subject,
  });

  if (existingMapping) {
    return res.status(400).json({
      message:
        "Conflict: This subject is already assigned to another teacher in this section.",
    });
  }

  // 2. If isClassTeacher is true, ensure no other Class Teacher exists for this specific section
  if (isClassTeacher) {
    const classTeacherConflict = await Routine.findOne({
      academicYear,
      campus,
      class: classId,
      section,
      isClassTeacher: true,
    });

    if (classTeacherConflict) {
      return res.status(400).json({
        message:
          "Conflict: This section already has a designated Class Teacher.",
      });
    }
  }

  const routine = await Routine.create(req.body);
  res.status(201).json({ status: "success", data: routine });
});

// @desc    Update mapping assignment
// @route   PUT /api/routine/:id
exports.updateRoutine = catchAsync(async (req, res) => {
  const routine = await Routine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!routine)
    return res.status(404).json({ message: "Assignment not found" });

  res.status(200).json(routine);
});

// @desc    Remove assignment mapping
// @route   DELETE /api/routine/:id
exports.deleteRoutine = catchAsync(async (req, res) => {
  const routine = await Routine.findByIdAndDelete(req.params.id);

  if (!routine)
    return res.status(404).json({ message: "Assignment not found" });

  res.status(200).json({ message: "Teacher assignment removed successfully" });
});

// @desc    Get Teacher's Specific Scopes (Used for Attendance Logic)
// @route   GET /api/routine/my-scopes
exports.getMyScopes = catchAsync(async (req, res) => {
  // Finds all sections where the logged-in user is assigned
  const scopes = await Routine.find({ teacher: req.user._id })
    .populate("class", "name")
    .populate("section", "name")
    .populate("campus", "name")
    .lean();

  // Formatting for the frontend scope logic
  const formattedScopes = scopes.map((s) => ({
    campusId: s.campus?._id,
    classId: s.class?._id,
    className: s.class?.name,
    sectionId: s.section?._id,
    sectionName: s.section?.name,
    isClassTeacher: s.isClassTeacher,
  }));

  res.status(200).json(formattedScopes);
});
