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

    const start = new Date(startTime);
    const end = new Date(endTime);

    const hours = (end - start) / (1000 * 60 * 60);

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // ✅ TIME CONFLICT CHECK
    const conflictingBooking = await Booking.findOne({
      rentalItem: rentalItemId,
      status: "booked",
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (conflictingBooking) {
      return res.status(400).json({
        message: "This rental is already booked for the selected time range",
      });
    }

    const totalPrice = hours * rentalItem.pricePerHour;

    const booking = await Booking.create({
      rentalItem: rentalItemId,
      user: req.user._id,
      startTime: start,
      endTime: end,
      totalPrice,
      status: "booked", // ✅ must match enum
    });

    console.log("BOOKING CREATED:", booking);

    return res.status(201).json(booking);

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("rentalItem");

    return res.json(bookings);
  } catch (error) {
    console.log("GET MY BOOKINGS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getBookingsForMyRentals = async (req, res) => {
  try {
    // Step 1: Find rentals owned by logged-in user
    const myRentals = await RentalItem.find({ owner: req.user._id });

    const rentalIds = myRentals.map(rental => rental._id);

    // Step 2: Find bookings for those rentals
    const bookings = await Booking.find({
      rentalItem: { $in: rentalIds },
    })
      .populate("user", "name email")
      .populate("rentalItem", "title location pricePerHour");

    return res.json(bookings);

  } catch (error) {
    console.log("OWNER BOOKINGS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};


const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id.trim();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only booking owner can cancel
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    // If already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.json({ message: "Booking cancelled successfully", booking });

  } catch (error) {
    console.log("CANCEL ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};


module.exports = { createBooking, cancelBooking , getMyBookings , getBookingsForMyRentals };
