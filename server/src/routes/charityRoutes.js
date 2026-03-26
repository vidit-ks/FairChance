const express = require("express");
const router = express.Router();
const {
  getCharities,
  createCharity,
  updateCharity,
  deleteCharity,
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
router.post("/", requireAuth, requireAdmin, createCharity);
router.put("/:id", requireAuth, requireAdmin, updateCharity);
router.delete("/:id", requireAuth, requireAdmin, deleteCharity);

module.exports = router;