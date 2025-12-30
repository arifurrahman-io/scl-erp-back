const checkCampusAccess = (req, res, next) => {
  const user = req.user;
  // campusId can come from params, query, or body depending on the request type
  const campusId =
    req.params.campusId || req.query.campusId || req.body.campusId;

  if (!campusId) {
    return res
      .status(400)
      .json({ message: "Campus ID is required for this operation" });
  }

  // Super Admin bypass
  if (user.role === "SUPER_ADMIN") {
    return next();
  }

  // Check if the campusId being accessed is in the user's assigned list
  const hasAccess = user.assignedCampuses.some(
    (id) => id.toString() === campusId.toString()
  );

  if (!hasAccess) {
    return res.status(403).json({
      message: "Access Denied: You are not assigned to this campus",
    });
  }

  next();
};

module.exports = { checkCampusAccess };
