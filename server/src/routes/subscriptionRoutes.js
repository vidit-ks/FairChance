const express = require("express");
const router = express.Router();
const {
  createSubscription,
  getUserSubscription,
  cancelSubscription,
  getAllSubscriptions,
  modifySubscription,
} = require("../controllers/subscriptionController");

const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/", requireAuth, createSubscription);
router.get("/:userId", requireAuth, getUserSubscription);
router.patch("/:id/cancel", requireAuth, cancelSubscription);
router.patch("/:id/modify", requireAuth, modifySubscription);

// Admin route
router.get("/all", requireAuth, requireAdmin, getAllSubscriptions);

module.exports = router;
