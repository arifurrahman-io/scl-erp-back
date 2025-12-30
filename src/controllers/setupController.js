const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Section = require("../models/Section");
const Student = require("../models/Student");
const catchAsync = require("../utils/catchAsync");

// ১. গ্লোবাল মাস্টার ক্লাস তৈরি (Blueprint)
exports.createMasterClass = async (req, res) => {
  try {
    const masterClass = await Class.create({ ...req.body, isMaster: true });
    res.status(201).json(masterClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ২. সকল মাস্টার ক্লাস দেখা
exports.getMasterClasses = async (req, res) => {
  try {
    const classes = await Class.find({ isMaster: true }).sort({ order: 1 });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৩. মাস্টার ক্লাসের আন্ডারে বিষয় ও নম্বর বিভাজন সেট করা
exports.createMasterSubject = async (req, res) => {
  try {
    const subject = await Subject.create({ ...req.body, isMaster: true });
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ৪. ক্যাম্পাসে ডেপ্লয় করা
exports.deployToCampus = async (req, res) => {
  try {
    const { masterClassId, campusId } = req.body;

    const templateClass = await Class.findById(masterClassId);
    if (!templateClass)
      return res.status(404).json({ message: "Blueprint not found" });

    const newCampusClass = await Class.create({
      name: templateClass.name,
      campus: campusId,
      isMaster: false,
    });

    const templateSubjects = await Subject.find({ class: masterClassId });

    if (templateSubjects.length > 0) {
      const clonedSubjects = templateSubjects.map((sub) => ({
        name: sub.name,
        code: sub.code,
        class: newCampusClass._id,
        passMarks: sub.passMarks,
        distribution: sub.distribution,
      }));
      await Subject.insertMany(clonedSubjects);
    }

    res.status(201).json({
      message: `${templateClass.name} সফলভাবে এই ক্যাম্পাসে ডেপ্লয় হয়েছে।`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ৫. ক্যাম্পাসের ক্লাসগুলো দেখা
exports.getClassesByCampus = async (req, res) => {
  try {
    const classes = await Class.find({ campus: req.params.campusId }).sort({
      order: 1,
    });
    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// বিষয় আপডেট এবং ডিলিট
exports.updateMasterSubject = async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        code: req.body.code,
        distribution: req.body.distribution,
      },
      { new: true }
    );
    res.status(200).json(updatedSubject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMasterSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Subject removed from blueprint" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSubjectsByClass = async (req, res) => {
  try {
    const subjects = await Subject.find({ class: req.params.classId });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCampusClass = async (req, res) => {
  try {
    const classToDelete = await Class.findById(req.params.id);
    if (!classToDelete)
      return res.status(404).json({ message: "Class not found" });
    if (classToDelete.isMaster)
      return res.status(403).json({ message: "Forbidden" });

    await Subject.deleteMany({ class: req.params.id });
    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DYNAMIC STRUCTURE LOGIC (উন্নত সংস্করণ) ---
// @desc    ক্যাম্পাসের ক্লাস/সেকশন ফেচ করা (শিক্ষক নিয়োগের সময় সব দেখাবে, এটেনডেন্সের সময় শুধু স্টুডেন্ট আছে এমনগুলো দেখাবে)
exports.getMasterStructure = async (req, res) => {
  try {
    const { campusId, academicYearId, hasStudents } = req.query;

    if (!campusId) {
      return res.status(400).json({ message: "Campus ID is required" });
    }

    let classQuery = { campus: campusId };
    let sectionQuery = { campus: campusId };

    // যদি ফ্রন্টএন্ড থেকে hasStudents === "true" পাঠানো হয় (যেমন: Attendance/Result Entry তে)
    // তখন শুধুমাত্র শিক্ষার্থী আছে এমন ক্লাস-সেকশন ফিল্টার হবে।
    if (hasStudents === "true" && academicYearId) {
      const [activeClassIds, activeSectionIds] = await Promise.all([
        Student.distinct("class", {
          campus: campusId,
          academicYear: academicYearId,
        }),
        Student.distinct("section", {
          campus: campusId,
          academicYear: academicYearId,
        }),
      ]);

      // যদি স্টুডেন্ট না থাকে তবে খালি এরে পাঠাবে যেন ক্রাশ না করে
      if (activeClassIds.length === 0) {
        return res.status(200).json({ classes: [], sections: [] });
      }

      classQuery._id = { $in: activeClassIds };
      sectionQuery._id = { $in: activeSectionIds };
    }

    // ডেটা ফেচ করা হচ্ছে
    const [classes, sections] = await Promise.all([
      Class.find(classQuery).select("name _id").sort({ name: 1 }),
      Section.find(sectionQuery).select("name _id").sort({ name: 1 }),
    ]);

    res.status(200).json({ classes, sections });
  } catch (error) {
    console.error("Master Structure Server Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Create a new section for a specific campus
// @route   POST /api/settings/sections
exports.createSection = async (req, res) => {
  try {
    const { name, campusId } = req.body;

    if (!name || !campusId) {
      return res
        .status(400)
        .json({ message: "Name and Campus ID are required" });
    }

    const section = await Section.create({
      name: name.toUpperCase(), // Standardize to uppercase (e.g., 'A')
      campus: campusId,
    });

    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sections belonging to a campus
// @route   GET /api/settings/sections/:campusId
exports.getSectionsByCampus = async (req, res) => {
  try {
    const sections = await Section.find({ campus: req.params.campusId }).sort({
      name: 1,
    });
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a section
// @route   DELETE /api/settings/sections/:id
exports.deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Section removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubjectsByClassAndCampus = async (req, res) => {
  try {
    const { classId } = req.params;
    const { campusId } = req.query;

    // Fetch subjects that are deployed specifically to this campus and class
    const subjects = await Subject.find({
      class: classId,
      campuses: campusId, // Assuming Subject model has a campuses array
    }).select("name code");

    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dynamic subjects",
      error: error.message,
    });
  }
};

exports.getStudentsForAttendance = catchAsync(async (req, res) => {
  const { class: classId, section: sectionId, campus: campusId } = req.query;

  // 1. Validate inputs to prevent CastErrors (Common cause of 500)
  if (!classId || !sectionId || !campusId) {
    return res
      .status(400)
      .json({ message: "Missing required filtering parameters" });
  }

  const filter = {
    class: classId,
    section: sectionId,
    campus: campusId,
    status: "Active", // Only show active students for attendance
  };

  // 2. Execute query with Lean for performance
  const students = await Student.find(filter)
    .select("name rollNumber studentId avatar") // Only fetch needed fields for attractive UI [cite: 2025-10-11]
    .sort({ rollNumber: 1 })
    .lean();

  res.status(200).json(students);
});
