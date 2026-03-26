const express = require("express");
const router = express.Router();
const { addScore, getScores, editScore, deleteScore } = require("../controllers/scoreController");
const requireAuth = require("../middleware/requireAuth");
const requireActiveSubscription = require("../middleware/requireActiveSubscription");

router.get("/", requireAuth, getScores); // Use req.user.id instead of /:userId
router.post("/", requireAuth, requireActiveSubscription, addScore);
router.put("/:id", requireAuth, requireActiveSubscription, editScore);
router.delete("/:id", requireAuth, requireActiveSubscription, deleteScore);

module.exports = router;