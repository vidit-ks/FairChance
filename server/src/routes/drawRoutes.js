const express = require("express");
const router = express.Router();
const {
  createDraw,
  publishDraw,
  getLatestDraw,
  getLatestResults,
  simulateDraw,
  getParticipationSummary
} = require("../controllers/drawController");

const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

// Admin routes
router.post("/create", requireAuth, requireAdmin, createDraw);
router.post("/:id/publish", requireAuth, requireAdmin, publishDraw);
router.post("/simulate", requireAuth, requireAdmin, simulateDraw);

// Public/User routes
router.get("/latest", getLatestDraw);
router.get("/results/latest", getLatestResults);
router.get("/participation", requireAuth, getParticipationSummary);

module.exports = router;