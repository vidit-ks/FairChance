const express = require("express");
const router = express.Router();
const {
  createDraw,
  publishDraw,
  getLatestDraw,
  getLatestResults,
} = require("../controllers/drawController");

const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

// Admin routes
router.post("/create", requireAuth, requireAdmin, createDraw);
router.post("/:id/publish", requireAuth, requireAdmin, publishDraw);

// Public routes
router.get("/latest", getLatestDraw);
router.get("/results/latest", getLatestResults);

module.exports = router;