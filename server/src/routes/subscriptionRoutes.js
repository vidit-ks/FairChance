const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getSubscription,
} = require("../controllers/subscriptionController");

router.post("/", createSubscription);
router.get("/:userId", getSubscription);

module.exports = router;