/**
 * @desc Logic for GPA and Grade Calculation
 */
const calculateGrade = (totalMarks) => {
  if (totalMarks >= 80) return { gpa: 5.0, grade: "A+" };
  if (totalMarks >= 70) return { gpa: 4.0, grade: "A" };
  if (totalMarks >= 60) return { gpa: 3.5, grade: "A-" };
  if (totalMarks >= 50) return { gpa: 3.0, grade: "B" };
  if (totalMarks >= 40) return { gpa: 2.0, grade: "C" };
  if (totalMarks >= 33) return { gpa: 1.0, grade: "D" };
  return { gpa: 0.0, grade: "F" };
};

const generateResult = (subjectMarks, isFourthSubject = false) => {
  // Logic to sum subjective, objective, and practicals
  const total =
    (subjectMarks.subjective || 0) +
    (subjectMarks.objective || 0) +
    (subjectMarks.practical || 0) +
    (subjectMarks.ct || 0);

  const result = calculateGrade(total);

  // 4th Subject Rule: Typically, anything above GPA 2.0 is added to total
  if (isFourthSubject) {
    result.contributionToTotal = Math.max(0, result.gpa - 2.0);
  }

  return result;
};

module.exports = { calculateGrade, generateResult };
