const express = require("express");
const router = express.Router();
const { addScore, getScores } = require("../controllers/scoreController");

router.post("/", addScore);
router.get("/:userId", getScores);

module.exports = router;