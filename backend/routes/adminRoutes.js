const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { protect, requireAdmin } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, requireAdmin, adminController.getDashboard);

router.get(
  "/booking",
  protect,
  requireAdmin,
  adminController.getBookingSummary,
);

router.get("/report", protect, requireAdmin, adminController.getReport);

module.exports = router;
