const express = require("express");
const router = express.Router();
const {
  getCharities,
  selectCharity,
  getSelectedCharity,
} = require("../controllers/charityController");

router.get("/", getCharities);
router.get("/selected/:userId", getSelectedCharity);
router.post("/select", selectCharity);

module.exports = router;