const Routine = require("../models/Routine");

exports.verifyClassTeacherScope = async (req, res, next) => {
  try {
    const { classId, sectionId, campusId } = req.body;
    const userId = req.user._id;

    // 1. Cross-Campus Security Check
    // Prevents a teacher from one campus posting for a class in another campus
    const assignment = await Routine.findOne({
      teacher: userId,
      campus: campusId, // Verified Campus
      class: classId,
      section: sectionId,
      isClassTeacher: true,
    });

    if (!assignment) {
      return res.status(403).json({
        message:
          "Unauthorized: You are not the Class Teacher for this section at this specific campus.",
      });
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during campus verification" });
  }
};
