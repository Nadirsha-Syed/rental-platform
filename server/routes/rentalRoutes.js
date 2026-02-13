const express = require("express");
const router = express.Router();
const {
  createRentalItem,
  getRentalItems,
  getRentalById,
} = require("../controllers/rentalController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRentalItem);
router.get("/", getRentalItems);
router.get("/:id", getRentalById);

module.exports = router;
