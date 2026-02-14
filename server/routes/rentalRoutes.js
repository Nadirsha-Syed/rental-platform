const express = require("express");
const router = express.Router();
const {
  createRentalItem,
  getRentalItems,
  getRentalById,
  updateRentalItem,
  deleteRentalItem,
} = require("../controllers/rentalController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRentalItem);
router.get("/", getRentalItems);
router.get("/:id", getRentalById);
router.put("/:id", protect, updateRentalItem);
router.delete("/:id", protect, deleteRentalItem);

module.exports = router;
