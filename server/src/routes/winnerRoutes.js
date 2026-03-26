const express = require("express");
const router = express.Router();
const { uploadProof, verifyProof, getAllProofs } = require("../controllers/winnerController");

const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");
const requireActiveSubscription = require("../middleware/requireActiveSubscription");

// Users upload proof 
router.post("/upload-proof", requireAuth, requireActiveSubscription, uploadProof);

// Admins manage proofs
router.patch("/:id/verify", requireAuth, requireAdmin, verifyProof);
router.get("/all", requireAuth, requireAdmin, getAllProofs);

module.exports = router;
