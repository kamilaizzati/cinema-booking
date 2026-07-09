const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const rateLimit = require("express-rate-limit");
const { protect } = require("../middleware/authMiddleware");


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Waktu: 15 Menit
  max: 5, // Maksimal percobaan: 5 kali
  message: {
    message: "Terlalu banyak percobaan login, coba lagi setelah 15 menit",
  },
});

// Endpoint Publik
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/me", protect, getMe);

module.exports = router;
