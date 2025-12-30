const User = require("../models/User");
const Campus = require("../models/Campus"); // Added to fetch campuses for Super Admin
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Find user and explicitly include password (since we set select: false in model)
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.comparePassword(password))) {
      let authorizedCampuses = [];

      // 2. Logic for "Every Year/Every Campus" for Super Admin
      if (user.role === "SUPER_ADMIN") {
        // Super Admin gets all campuses automatically
        authorizedCampuses = await Campus.find({ status: "Active" });
      } else {
        // Others use the populated assignedCampuses field
        // We fetch the user again with population to avoid the strictPopulate error
        // if the field is newly added.
        const userWithCampuses = await User.findById(user._id).populate(
          "assignedCampuses"
        );
        authorizedCampuses = userWithCampuses.assignedCampuses || [];
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        campuses: authorizedCampuses, // Frontend uses this for the Campus Switcher
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
