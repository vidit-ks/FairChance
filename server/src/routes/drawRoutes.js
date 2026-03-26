const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");
const { createDraw, publishDraw, getLatestDraw, getLatestResults, simulateDraw, getParticipationSummary, editDrawPool } = require("../controllers/drawController");

// Admin routes
router.post("/create", requireAuth, requireAdmin, createDraw);
router.post("/:id/publish", requireAuth, requireAdmin, publishDraw);
router.post("/simulate", requireAuth, requireAdmin, simulateDraw);
router.patch("/:id/pool", requireAuth, requireAdmin, editDrawPool);

// Public/User routes
router.get("/latest", getLatestDraw);
router.get("/results/latest", getLatestResults);
router.get("/participation", requireAuth, getParticipationSummary);

module.exports = router;