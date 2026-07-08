const express = require("express");
const router = express.Router();

const {
  getAllBioskop,
  getBioskopById,
  createBioskop,
  updateBioskop,
  deleteBioskop,
} = require("../controllers/bioskopController");

router.get("/", getAllBioskop);
router.get("/:id", getBioskopById);
router.post("/", createBioskop);
router.put("/:id", updateBioskop);
router.delete("/:id", deleteBioskop);
module.exports = router;