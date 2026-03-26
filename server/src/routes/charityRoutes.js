const express = require("express");
const router = express.Router();
const {
  getCharities,
  updateCharity,
  selectCharity,
  getSelectedCharity,
} = require("../controllers/charityController");

const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

// Public routes
router.get("/", getCharities);

// Protected routes
router.post("/select", requireAuth, selectCharity);
router.get("/selected", requireAuth, getSelectedCharity);

// Admin routes
router.put("/:id", requireAuth, requireAdmin, updateCharity);

module.exports = router;