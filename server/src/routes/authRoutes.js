const express = require("express");
const router = express.Router();

const { signup, login, getAllUsers, updateUser } = require("../controllers/authController");
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", requireAuth, requireAdmin, getAllUsers);
router.put("/users/:id", requireAuth, requireAdmin, updateUser);

module.exports = router;
