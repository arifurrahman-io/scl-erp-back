const Campus = require("../models/Campus");
const AcademicYear = require("../models/AcademicYear");
const SchoolProfile = require("../models/SchoolProfile");

// --- CAMPUS CRUD OPERATIONS ---

/**
 * @desc    Get all campuses (filtered by user role)
 * @route   GET /api/campuses
 */
exports.getCampuses = async (req, res) => {
  try {
    let campuses;
    const filter = { isActive: true };

    if (req.user.role === "SUPER_ADMIN") {
      campuses = await Campus.find(filter).sort({ name: 1 });
    } else {
      campuses = await Campus.find({
        _id: { $in: req.user.assignedCampuses },
        ...filter,
      }).sort({ name: 1 });
    }
    res.status(200).json(campuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new campus branch
 * @route   POST /api/campuses
 */
exports.createCampus = async (req, res) => {
  try {
    const campus = await Campus.create(req.body);
    res.status(201).json(campus);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create campus", error: error.message });
  }
};

/**
 * @desc    Update a campus
 * @route   PUT /api/campuses/:id
 */
exports.updateCampus = async (req, res) => {
  try {
    const campus = await Campus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!campus) return res.status(404).json({ message: "Campus not found" });
    res.status(200).json(campus);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Delete a campus
 * @route   DELETE /api/campuses/:id
 */
exports.deleteCampus = async (req, res) => {
  try {
    const campus = await Campus.findByIdAndDelete(req.params.id);
    if (!campus) return res.status(404).json({ message: "Campus not found" });
    res.status(200).json({ message: "Campus deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- ACADEMIC YEAR MANAGEMENT ---

/**
 * @desc    Get currently active academic year
 */
exports.getActiveYear = async (req, res) => {
  try {
    const activeYear = await AcademicYear.findOne({ isCurrent: true });
    res.status(200).json(activeYear || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get All Academic Years
 */
exports.getAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find({}).sort({ year: -1 });
    res.status(200).json(years);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new Academic Year
 */
exports.setupAcademicYear = async (req, res) => {
  try {
    const { isCurrent } = req.body;
    if (isCurrent) {
      await AcademicYear.updateMany({}, { isCurrent: false });
    }
    const newYear = await AcademicYear.create(req.body);
    res.status(201).json(newYear);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Set a specific year as the current active session
 * @route   PATCH /api/campuses/academic-years/set-current/:id
 */
exports.setCurrentYear = async (req, res) => {
  try {
    const { id } = req.params;
    await AcademicYear.updateMany({}, { isCurrent: false });
    const updatedYear = await AcademicYear.findByIdAndUpdate(
      id,
      { isCurrent: true },
      { new: true }
    );
    if (!updatedYear)
      return res.status(404).json({ message: "Year not found" });
    res.status(200).json(updatedYear);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SCHOOL PROFILE / BRANDING ---

/**
 * @desc    Get School Profile Branding
 */
exports.getSchoolProfile = async (req, res) => {
  try {
    const profile = await SchoolProfile.findOne();
    res.status(200).json(profile || { name: "My School ERP" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update School Profile Branding
 */
exports.updateSchoolProfile = async (req, res) => {
  try {
    const profile = await SchoolProfile.findOneAndUpdate({}, req.body, {
      upsert: true,
      new: true,
    });
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
