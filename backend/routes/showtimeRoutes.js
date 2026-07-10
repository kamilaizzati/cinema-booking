const express = require("express");
const router = express.Router();
const { protect, requireAdmin } = require("../middleware/authMiddleware");
const {
  getShowtimesByMovie,
  getShowtimeById,
  getSeatAvailability,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} = require("../controllers/showtimeController");

// =====================================================
// PUBLIC API
// =====================================================

// GET daftar showtime berdasarkan movie
// GET /api/movies/:movieId/showtimes
router.get("/movies/:movieId/showtimes", getShowtimesByMovie);

// GET detail showtime
// GET /api/showtimes/:id
router.get("/showtimes/:id", getShowtimeById);

// GET kursi yang sudah dibooking
// GET /api/showtimes/:id/seats
router.get("/showtimes/:id/seats", getSeatAvailability);


// =====================================================
// ADMIN API
// =====================================================

// POST tambah showtime
// POST /api/showtimes
router.post("/showtimes", protect, requireAdmin, createShowtime);

// PUT update showtime
// PUT /api/showtimes/:id
router.put("/showtimes/:id", protect, requireAdmin, updateShowtime);

// DELETE showtime
// DELETE /api/showtimes/:id
router.delete("/showtimes/:id", protect, requireAdmin, deleteShowtime);

module.exports = router;