const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { createBooking, cancelBooking , getMyBookings ,getBookingsForMyRentals} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");


router.get("/", protect, async (req, res) => {
  const bookings = await Booking.find()
  .populate("user", "name email")
  .populate("rentalItem", "title pricePerHour");
  
  res.json(bookings);
});


router.get("/my-bookings", protect, getMyBookings);
router.post("/", protect, createBooking);
router.put("/:id/cancel", protect, cancelBooking);
router.get("/owner-bookings", protect,authorizeRoles("vendor", "admin"), getBookingsForMyRentals);

module.exports = router;
