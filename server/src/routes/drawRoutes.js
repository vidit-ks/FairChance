const express = require("express");
const router = express.Router();
const {
  runDraw,
  getLatestDraw,
  getLatestResults,
} = require("../controllers/drawController");

router.post("/run", runDraw);
router.get("/latest", getLatestDraw);
router.get("/results/latest", getLatestResults);

module.exports = router;