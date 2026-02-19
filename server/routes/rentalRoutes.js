const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  createRentalItem,
  getRentalItems,
  getRentalById,
  updateRentalItem,
  deleteRentalItem,
} = require("../controllers/rentalController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("vendor", "admin"),createRentalItem);
router.get("/", getRentalItems);
router.get("/:id", getRentalById);
router.put("/:id", protect, updateRentalItem);
router.delete("/:id", protect, deleteRentalItem);

module.exports = router;
