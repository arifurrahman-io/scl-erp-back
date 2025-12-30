const AcademicYear = require("../models/AcademicYear");

// Make sure the name is "getAcademicYears" (plural) to match the route import
exports.getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ startDate: -1 });
    res.status(200).json(years);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveYear = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isCurrent: true });
    res.json(activeYear);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
