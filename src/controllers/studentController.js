const Student = require("../models/Student");
const Campus = require("../models/Campus");

/**
 * @desc    Register a new student
 * @route   POST /api/students/:campusId/register
 */
exports.registerStudent = async (req, res) => {
  try {
    const studentData = req.body;

    // 1. Check for Roll Number conflict within the same context
    // Matches the unique index: campus + class + section + roll + academicYear
    const duplicateRoll = await Student.findOne({
      campus: studentData.campus,
      class: studentData.class,
      section: studentData.section,
      roll: studentData.roll,
      academicYear: studentData.academicYear,
    });

    if (duplicateRoll) {
      return res.status(400).json({
        message: `Roll ${studentData.roll} is already assigned in ${studentData.class} Section ${studentData.section}`,
      });
    }

    // 2. Ensure Student ID is globally unique
    const duplicateId = await Student.findOne({
      studentId: studentData.studentId,
    });
    if (duplicateId) {
      return res.status(400).json({ message: "Student ID already exists" });
    }

    // 3. Create Student record
    const newStudent = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: "Student enrolled successfully",
      student: newStudent,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({
      message: "Data validation failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Get filtered student list
 * @route   GET /api/students?academicYearId=...&campusId=...
 */
exports.getStudentsByFilters = async (req, res) => {
  try {
    const { academicYearId, campusId } = req.query;

    const filter = {};

    // 1. Filter by Academic Year (Stored as ObjectId in DB)
    if (academicYearId && academicYearId !== "undefined") {
      filter.academicYear = academicYearId;
    }

    // 2. Filter by Campus
    // Since DB stores String names like "Banasree-Day", we find the name for the ID
    if (campusId && campusId !== "undefined") {
      const campusDoc = await Campus.findById(campusId);
      if (campusDoc) {
        filter.campus = campusDoc.name;
      }
    }

    // 3. Execute Search
    const students = await Student.find(filter)
      .sort({ class: 1, roll: 1 }) // Sorted for better directory view
      .lean(); // Faster performance for read-only lists

    res.status(200).json(students);
  } catch (error) {
    console.error("Fetch Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching directory" });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Search by your custom 'studentId' field, not the MongoDB '_id'
    const student = await Student.findOne({ studentId: studentId });

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
