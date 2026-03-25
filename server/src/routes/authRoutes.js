import { getAllUsers } from "../controllers/authController.js";
const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/users", getAllUsers);

module.exports = router;
