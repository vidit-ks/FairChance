const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required before checking admin role" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin privileges required" });
  }

  next();
};

module.exports = requireAdmin;
