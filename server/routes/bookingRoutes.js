const express = require("express");
const router = express.Router();
const { createBooking } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");


router.get("/", protect, async (req, res) => {
  const bookings = await Booking.find()
    .populate("user", "name email")
    .populate("rentalItem", "title pricePerHour");

  res.json(bookings);
});


router.post("/", protect, createBooking);

module.exports = router;
