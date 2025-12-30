const Routine = require("../models/Routine");

exports.canPostMarks = async (req, res, next) => {
  const { classId, sectionId, subjectId } = req.body;

  // Super Admins bypass routine checks
  if (req.user.role === "SUPER_ADMIN") return next();

  const hasRoutine = await Routine.findOne({
    teacher: req.user._id,
    class: classId,
    section: sectionId,
    subject: subjectId,
  });

  if (!hasRoutine) {
    return res.status(403).json({
      message: "You are not assigned to this class/subject in your routine.",
    });
  }
  next();
};

exports.isAssignedClassTeacher = async (req, res, next) => {
  const { classId, sectionId } = req.body;

  const assignment = await Routine.findOne({
    teacher: req.user._id,
    class: classId,
    section: sectionId,
    isClassTeacher: true,
  });

  if (!assignment && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      message: "Only the assigned Class Teacher can post attendance.",
    });
  }
  next();
};
