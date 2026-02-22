const express = require("express");
const router = express.Router();

const { authorizeRoles } = require("../middleware/roleMiddleware");
const { protect } = require("../middleware/authMiddleware");

const {
  createRentalItem,
  getRentalItems,
  getRentalById,
  updateRentalItem,
  deleteRentalItem,
} = require("../controllers/rentalController");

router.post(
  "/",
  protect,
  authorizeRoles("vendor", "admin"),
  async (req, res, next) => {
    if (req.user.role === "vendor" && !req.user.isApproved) {
      return res.status(403).json({
        message: "Vendor not approved by admin",
      });
    }
    next();
  },
  createRentalItem
);

router.get("/", getRentalItems);
router.get("/:id", getRentalById);
router.put("/:id", protect, updateRentalItem);
router.delete("/:id", protect, deleteRentalItem);

module.exports = router;
