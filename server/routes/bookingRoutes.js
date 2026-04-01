const express = require("express");
const router = express.Router();
const { 
  createBooking, 
  cancelBooking, 
  getMyBookings, 
  getBookingsForMyRentals, 
  getOwnerRevenue, 
  confirmBooking 
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// 1. General Booking Routes
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.put("/:id/confirm", protect, confirmBooking);
router.put("/:id/cancel", protect, cancelBooking);

// 2. Owner/P2P Dashboard Routes (RESTRICTION REMOVED)
// We removed 'authorizeRoles' so any logged-in user can see their own stats
router.get("/owner-bookings", protect, getBookingsForMyRentals);
router.get("/owner-revenue", protect, getOwnerRevenue);

module.exports = router;
// router.put("/:id/confirm", protect, confirmBooking);
// router.get(
//   "/owner-revenue",
//   protect,
//   authorizeRoles("vendor", "admin"),
//   getOwnerRevenue
// );


