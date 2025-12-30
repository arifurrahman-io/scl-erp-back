const User = require("../models/User");
const Class = require("../models/Class");
const Section = require("../models/Section");
const catchAsync = require("../utils/catchAsync");

// @desc    Get all users (Populated for Academic/Administrative views)
exports.getUsers = catchAsync(async (req, res) => {
  const { roleGroup, academicYearId } = req.query;
  let query = {};

  // Grouping logic for frontend tabs
  if (roleGroup === "ACADEMIC") {
    query.role = { $in: ["TEACHER", "CLASS_TEACHER"] };
  } else if (roleGroup === "ADMINISTRATIVE") {
    query.role = { $in: ["ADMIN", "ACCOUNTANT"] };
  }

  const users = await User.find(query)
    .populate("assignedCampuses", "name")
    .populate({
      path: "classTeacherOf.class",
      select: "name",
      model: "Class",
    })
    .populate({
      path: "classTeacherOf.section",
      select: "name",
      model: "Section",
    })
    .select("-password")
    .lean();

  res.status(200).json(users);
});

// @desc    Register a new staff member with campus and lead assignments
exports.registerUser = catchAsync(async (req, res) => {
  const { name, email, password, role, assignedCampuses, classTeacherOf } =
    req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role,
    assignedCampuses: assignedCampuses || [],
    classTeacherOf: role === "CLASS_TEACHER" ? classTeacherOf : undefined,
    status: "Active",
  });

  res.status(201).json({ status: "success", user: newUser });
});

// @desc    Update staff profile, password, or campus rights
exports.updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      assignedCampuses,
      classTeacherOf,
      status,
      password,
    } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update standard fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.assignedCampuses = assignedCampuses || user.assignedCampuses;
    user.status = status || user.status;

    // Handle role-specific logic
    if (role === "CLASS_TEACHER") {
      user.classTeacherOf = classTeacherOf;
    } else {
      user.classTeacherOf = undefined;
    }

    // Only set password if a new one is provided
    if (password && password.trim() !== "") {
      user.password = password;
    }

    // This save() call will trigger the pre-save hook in User.js
    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("UPDATE_USER_ERROR:", error); // Logging the specific error
    res.status(500).json({ message: error.message || "Update failed" });
  }
};

// @desc    Delete staff record
exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.role === "SUPER_ADMIN") {
    return res.status(403).json({ message: "Cannot delete Super Admin" });
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Record removed" });
});

exports.getUsersByGroup = async (req, res) => {
  try {
    const { roleGroup, campusId } = req.query;
    const filter = { status: "Active" };

    // 1. Role Group Filtering logic
    if (roleGroup === "ACADEMIC") {
      filter.role = { $in: ["TEACHER", "CLASS_TEACHER"] };
    }

    // 2. Campus Assignment Check
    if (campusId) {
      filter.assignedCampuses = { $in: [campusId] };
    }

    // 3. FIX: Query the USER model, not Student
    const users = await User.find(filter)
      .select("name role photo assignedCampuses")
      .lean();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Access denied to user directory" });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
