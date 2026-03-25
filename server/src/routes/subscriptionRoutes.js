const express = require("express");
const router = express.Router();
const { getAllSubscriptions } = require("../controllers/subscriptionController");

// other routes...
router.get("/all", getAllSubscriptions);

module.exports = router;
