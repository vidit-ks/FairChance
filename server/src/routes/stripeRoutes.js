const express = require("express");
const router = express.Router();
const { createCheckoutSession, createPortalSession, handleWebhook } = require("../controllers/stripeController");
const requireAuth = require("../middleware/requireAuth");

router.post("/checkout", requireAuth, createCheckoutSession);
router.post("/portal", requireAuth, createPortalSession);

// Webhook requires raw body parsing, this MUST be hooked in app.js before express.json()
// Alternatively we handle it straight via express mapping. We export it separately if needed, 
// but we'll assume index.js forwards it correctly.
router.post("/webhook", express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
