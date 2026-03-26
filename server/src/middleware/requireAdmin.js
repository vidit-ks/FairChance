const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required before checking admin role" });
  }

  if (String(req.user.role || "").trim().toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Access denied: Admin privileges required" });
  }

  next();
};

module.exports = requireAdmin;
