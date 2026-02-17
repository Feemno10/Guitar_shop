exports.isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "ต้องเป็น Admin เท่านั้น",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
