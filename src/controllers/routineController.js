const Routine = require("../models/Routine");

// @desc    Get the logged-in teacher's schedule
exports.getMyRoutine = async (req, res) => {
  try {
    const routine = await Routine.find({ teacher: req.user._id })
      .populate("class", "name")
      .populate("section", "name")
      .populate("subject", "name")
      .sort({ day: 1, startTime: 1 });

    res.status(200).json(routine);
  } catch (error) {
    console.error("GET_MY_ROUTINE_ERROR:", error);
    res.status(500).json({ message: "Error fetching routine" });
  }
};

// @desc    Get unique classes/subjects assigned for dropdowns
// IMPROVEMENT: Added "Unique" filtering so same class doesn't appear twice
exports.getAssignedScopes = async (req, res) => {
  try {
    const assignments = await Routine.find({ teacher: req.user._id })
      .populate("class", "name")
      .populate("section", "name")
      .populate("subject", "name");

    const scopes = assignments.map((a) => ({
      classId: a.class?._id,
      className: a.class?.name,
      sectionId: a.section?._id,
      sectionName: a.section?.name,
      subjectId: a.subject?._id,
      subjectName: a.subject?.name,
      isClassTeacher: a.isClassTeacher,
    }));

    // Remove duplicates if teacher teaches multiple periods for same class/subject
    const uniqueScopes = Array.from(
      new Set(scopes.map((s) => JSON.stringify(s)))
    ).map((s) => JSON.parse(s));

    res.status(200).json(uniqueScopes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scopes" });
  }
};

// @desc    Admin: Get full routine for a specific class/section
exports.getAdminRoutineView = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;
    const routine = await Routine.find({ class: classId, section: sectionId })
      .populate("teacher", "name")
      .populate("subject", "name")
      .sort({ day: 1, startTime: 1 });

    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ message: "Error fetching class routine" });
  }
};

// @desc    Assign a teacher to a slot
exports.createRoutine = async (req, res) => {
  try {
    const {
      teacher,
      class: classId,
      section,
      subject,
      day,
      startTime,
      endTime,
      isClassTeacher,
      academicYear,
    } = req.body;

    // Conflict Check
    const conflict = await Routine.findOne({
      teacher,
      day,
      startTime,
      academicYear,
    });
    if (conflict) {
      return res.status(400).json({
        message: "Teacher is already assigned to another class at this time.",
      });
    }

    const newRoutine = await Routine.create({
      teacher,
      campus: req.user.campusId,
      class: classId,
      section,
      subject,
      day,
      startTime,
      endTime,
      isClassTeacher,
      academicYear,
    });

    res.status(201).json(newRoutine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a routine assignment
exports.deleteRoutine = async (req, res) => {
  try {
    await Routine.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Assignment removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting routine" });
  }
};
