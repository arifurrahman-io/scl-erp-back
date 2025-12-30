const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect: Verifies the JWT and ensures the user exists and is active.
 * Used as the first gate for any private route.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the database and attach to request
      req.user = await User.findById(decoded.id).select("-password");

      // 4. Verify user exists and status is Active
      if (!req.user) {
        return res.status(401).json({
          message: "The user belonging to this token no longer exists.",
        });
      }

      if (req.user.status !== "Active") {
        return res.status(401).json({
          message:
            "Your account is currently inactive. Please contact your Super Admin.",
        });
      }

      // 5. Grant Access
      next();
    } catch (error) {
      console.error("JWT_VERIFY_ERROR:", error.message);

      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Your session has expired. Please login again." });
      }

      return res
        .status(401)
        .json({ message: "Not authorized, token invalid." });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No security token provided." });
  }
};

/**
 * Admin: Legacy helper for Super Admin only access.
 * Use restrictTo('SUPER_ADMIN') for newer routes.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "SUPER_ADMIN") {
    next();
  } else {
    return res.status(403).json({
      message: "Security violation: Super Admin privileges required.",
    });
  }
};

/**
 * RestrictTo: Flexible Role-Based Access Control (RBAC).
 * Allows access to any role provided in the arguments.
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // 1. Safety check: Ensure protect middleware ran first
    if (!req.user) {
      return res.status(500).json({
        message:
          "Middleware Error: User context missing. Ensure 'protect' is called before 'restrictTo'.",
      });
    }

    // 2. Check if user role is authorized
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Permission denied. Required role: [${roles.join(
          " or "
        )}]. Your role: ${req.user.role}`,
      });
    }

    // 3. Authorized
    next();
  };
};

module.exports = { protect, admin, restrictTo };
