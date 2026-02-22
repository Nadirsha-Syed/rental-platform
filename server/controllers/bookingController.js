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
      status: "confirmed",
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (conflictingBooking) {
      return res.status(400).json({
        message: "This rental is already confirmed for the selected time range",
      });
    }

    const totalPrice = hours * rentalItem.pricePerHour;

    const booking = await Booking.create({
      rentalItem: rentalItemId,
      user: req.user._id,
      startTime: start,
      endTime: end,
      totalPrice,
      status: "confirmed", // ✅ must match enum
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


const getOwnerRevenue = async (req, res) => {
  try {
    // Step 1: Get rentals owned by vendor
    const myRentals = await RentalItem.find({ owner: req.user._id });
    const rentalIds = myRentals.map(r => r._id);

    // Step 2: Get bookings for those rentals
    const bookings = await Booking.find({
      rentalItem: { $in: rentalIds },
    });

    let totalRevenue = 0;
    let activeBookings = 0;
    let cancelledBookings = 0;

    bookings.forEach((booking) => {
      if (booking.status !== "cancelled") {
        totalRevenue += booking.totalPrice;
        activeBookings++;
      } else {
        cancelledBookings++;
      }
    });

    res.json({
      totalBookings: bookings.length,
      activeBookings,
      cancelledBookings,
      totalRevenue,
    });

  } catch (error) {
    console.log("REVENUE ERROR:", error);
    res.status(500).json({ message: error.message });
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

const confirmBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== "pending") {
    return res.status(400).json({ message: "Booking cannot be confirmed" });
  }
  
  if (booking.expiresAt < new Date()) {
  booking.status = "expired";
  await booking.save();

  return res.status(400).json({
    message: "Booking has expired",
  });
}
  // Simulate successful payment
  booking.status = "confirmed";
  booking.paymentStatus = "paid";

  await booking.save();

  res.json({
    success: true,
    message: "Booking confirmed successfully",
    data: booking,
  });
};

module.exports = { createBooking, cancelBooking , getMyBookings , getBookingsForMyRentals , getOwnerRevenue , confirmBooking , };
