const express = require("express");
const router = express.Router();

const {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationController");

// GET semua lokasi
router.get("/", getAllLocations);

// GET lokasi berdasarkan ID
router.get("/:id", getLocationById);

// POST tambah lokasi
router.post("/", createLocation);

// PUT update lokasi
router.put("/:id", updateLocation);

// DELETE hapus lokasi
router.delete("/:id", deleteLocation);

module.exports = router;
