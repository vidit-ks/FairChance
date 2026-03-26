const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { createSubscription, handleWebhook } = require("../controllers/paymentController");
const requireAuth = require("../middleware/requireAuth");

router.post("/create-subscription", requireAuth, createSubscription);

// Webhook from Razorpay doesn't require standard user Auth, but Requires crypto body
router.post("/webhook", handleWebhook);

module.exports = router;
