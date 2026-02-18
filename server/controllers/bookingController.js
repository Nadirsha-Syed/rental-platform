const Booking = require("../models/Booking");
const RentalItem = require("../models/RentalItem");

const createBooking = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { rentalItemId, startTime, endTime } = req.body;

    if (!rentalItemId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing booking data" });
    }

    const rentalItem = await RentalItem.findById(rentalItemId);

    if (!rentalItem) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    const hours =
      (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    const totalPrice = hours * rentalItem.pricePerHour;

    const booking = await Booking.create({
      rentalItem: rentalItemId,
      user: req.user._id,
      startTime,
      endTime,
      totalPrice,
      status: "pending",
    });

    console.log("BOOKING CREATED:", booking);

    return res.status(201).json(booking);

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking };
