// --- userController.js UPDATED ---
const User = require("../models/User");
// Ensure these are imported to register the schemas for population
const Class = require("../models/Class");
const Section = require("../models/Section");

// @desc    Get all users (Filtered for specialized management nodes)
exports.getUsers = async (req, res) => {
  try {
    const { roleGroup, academicYearId } = req.query;
    let query = {};

    if (roleGroup === "ACADEMIC") {
      query.role = { $in: ["TEACHER", "CLASS_TEACHER"] };
    }

    // Deep population with explicit strictPopulate override for safety
    const users = await User.find(query)
      .populate("assignedCampuses", "name")
      .populate({
        path: "classTeacherOf.class",
        select: "name",
        strictPopulate: false,
      })
      .populate({
        path: "classTeacherOf.section",
        select: "name",
        strictPopulate: false,
      })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("SERVER_CRASH_LOG:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new staff member
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedCampuses, classTeacherOf } =
      req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // UPDATED: Structure the creation to include potential class teacher assignments
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      assignedCampuses: assignedCampuses || [],
      classTeacherOf: role === "CLASS_TEACHER" ? classTeacherOf : undefined,
      status: "Active",
    });

    res.status(201).json({
      status: "success",
      message: "Staff member registered successfully",
      user: { id: newUser._id, name: newUser.name, role: newUser.role },
    });
  } catch (error) {
    console.error("REGISTER_USER_ERROR:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

// @desc    Update staff profile or role
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

    // Update basic fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.assignedCampuses = assignedCampuses || user.assignedCampuses;
    user.status = status || user.status;

    // UPDATED: Handle Class Teacher Assignment updates
    if (role === "CLASS_TEACHER") {
      user.classTeacherOf = classTeacherOf;
    } else {
      // If role changed from CLASS_TEACHER to TEACHER, clear the lead assignment
      user.classTeacherOf = undefined;
    }

    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("UPDATE_USER_ERROR:", error);
    res.status(500).json({ message: error.message || "Update failed" });
  }
};

// @desc    Delete staff member
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "SUPER_ADMIN") {
      return res
        .status(403)
        .json({ message: "Super Admin accounts cannot be deleted" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Staff record removed successfully" });
  } catch (error) {
    console.error("DELETE_USER_ERROR:", error);
    res.status(500).json({ message: error.message || "Deletion failed" });
  }
};
