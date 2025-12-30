const Student = require("../models/Student");
const Campus = require("../models/Campus");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");

/**
 * @desc    Register a new student
 * @route   POST /api/students/:campusId/register
 */
exports.registerStudent = async (req, res) => {
  try {
    const { campusId } = req.params;
    const studentData = req.body;

    // 1. FLEXIBLE ACADEMIC YEAR HANDLING
    const isObjectId = mongoose.Types.ObjectId.isValid(
      studentData.academicYear
    );

    // 2. CHECK FOR ROLL CONFLICT WITHIN CONTEXT
    // Checks if the roll is taken in the same Class, Section, and Campus
    const duplicateRoll = await Student.findOne({
      campus: studentData.campus,
      class: studentData.class,
      section: studentData.section,
      roll: studentData.roll,
      academicYear: isObjectId ? studentData.academicYear : null,
    });

    if (duplicateRoll) {
      return res.status(400).json({
        message: `Roll ${studentData.roll} is already assigned in ${studentData.class} Section ${studentData.section}`,
      });
    }

    // 3. ENSURE STUDENT ID IS GLOBALLY UNIQUE
    const duplicateId = await Student.findOne({
      studentId: studentData.studentId,
    });
    if (duplicateId) {
      return res.status(400).json({ message: "Student ID already exists" });
    }

    // 4. CREATE STUDENT RECORD WITH CAMPUS LINK
    // We explicitly save campusId to fix the "No records found" directory issue
    const newStudent = await Student.create({
      ...studentData,
      campusId: campusId, // Storing reference for fast filtering
      academicYear: isObjectId ? studentData.academicYear : undefined,
    });

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

    // 1. Filter by Academic Year ObjectId
    if (
      academicYearId &&
      academicYearId !== "undefined" &&
      academicYearId !== "null"
    ) {
      filter.academicYear = academicYearId;
    }

    // 2. Filter by Campus
    // To fix Anaya's record (which has no ID), we filter by name if ID is missing in DB
    if (campusId && campusId !== "undefined" && campusId !== "null") {
      const campusDoc = await Campus.findById(campusId);
      if (campusDoc) {
        // Find students that match either the ObjectId OR the string name
        filter.$or = [{ campusId: campusId }, { campus: campusDoc.name }];
      }
    }

    // 3. Execute Search with sorting for "Attractive UI"
    const students = await Student.find(filter)
      .sort({ class: 1, roll: 1 })
      .lean();

    res.status(200).json(students);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Error fetching student directory" });
  }
};

/**
 * @desc    Get Student by custom Student ID string
 */
exports.getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId: studentId });

    if (!student) {
      return res.status(404).json({ message: "Student record not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get Student by MongoDB _id (For Editing)
 */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Record not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update Student Record
 */
exports.getStudentsForAttendance = catchAsync(async (req, res) => {
  const {
    class: className,
    section: sectionName,
    campus: campusId,
  } = req.query;

  // 1. Build the filter to match your actual database schema
  const filter = {
    campusId: campusId, // MongoDB uses campusId (capital I)
    class: className, // Expecting "Four"
    section: sectionName, // Expecting "A"
  };

  // 2. Fetch students and select only UI-relevant fields [cite: 2025-10-11]
  const students = await Student.find(filter)
    .select("name studentId rollNumber photo")
    .sort({ rollNumber: 1 })
    .lean();

  res.status(200).json(students);
});

exports.updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.status(200).json({
    status: "success",
    data: student,
  });
});
