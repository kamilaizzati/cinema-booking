const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");

// IMPORT MIDDLEWARE DI SINI
const { protect } = require("../middleware/authMiddleware");

// Endpoint Publik
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
