const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getUserSubscription,
  cancelSubscription,
  getAllSubscriptions,
  modifySubscription,
  requestOfflineSubscription,
  decideOfflineSubscription
} = require("../controllers/subscriptionController");

const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/", requireAuth, createSubscription);
router.post("/request", requireAuth, requestOfflineSubscription);
router.get("/:userId", requireAuth, getUserSubscription);
router.patch("/:id/cancel", requireAuth, cancelSubscription);
router.patch("/:id/modify", requireAuth, modifySubscription);

// Admin routes
router.get("/all", requireAuth, requireAdmin, getAllSubscriptions);
router.patch("/:id/decide", requireAuth, requireAdmin, decideOfflineSubscription);

module.exports = router;
