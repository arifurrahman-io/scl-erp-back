const Marks = require("../models/Marks");
const Student = require("../models/Student");

exports.generateClassReport = async (req, res) => {
  try {
    const { classId, sectionId, term } = req.query;

    // 1. Fetch all students in the section
    const students = await Student.find({ classId, sectionId }).sort({
      roll: 1,
    });

    // 2. Fetch all marks for this term
    const marksData = await Marks.find({ classId, sectionId, term }).populate(
      "subjectId"
    );

    // 3. Process data into Report Card format
    const reports = students.map((student) => {
      const studentMarks = marksData.filter(
        (m) => m.studentId.toString() === student._id.toString()
      );

      let totalObtained = 0;
      let totalPossible = 0;

      const subjects = studentMarks.map((m) => {
        totalObtained += m.obtainedMarks;
        totalPossible += 100; // Assuming 100 is max
        return {
          name: m.subjectId.name,
          marks: m.obtainedMarks,
          grade: calculateGrade(m.obtainedMarks),
        };
      });

      return {
        studentName: student.name,
        roll: student.roll,
        subjects,
        percentage: ((totalObtained / totalPossible) * 100).toFixed(2),
        finalGrade: calculateGrade(totalObtained / studentMarks.length),
      };
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report" });
  }
};

// Helper for grading logic
const calculateGrade = (marks) => {
  if (marks >= 80) return "A+";
  if (marks >= 70) return "A";
  if (marks >= 60) return "A-";
  if (marks >= 50) return "B";
  return "F";
};
