import Booking from "../models/Booking.js";
import RentalItem from "../models/RentalItem.js";

export const createBooking = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { rentalItemId, startTime, endTime } = req.body;

    // 1. Validation
    if (!rentalItemId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing booking data" });
    }

    // 2. Fetch the item using the Model
    const item = await RentalItem.findById(rentalItemId);

    if (!item) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // 3. TIME CONFLICT CHECK
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

    // 4. Calculate total
    const totalPrice = Math.round(hours * item.pricePerHour);

    // 5. Create the booking
    const booking = await Booking.create({
      rentalItem: rentalItemId,
      user: req.user._id,
      startTime: start,
      endTime: end,
      totalPrice,
      status: "confirmed", 
    });

    console.log("BOOKING CREATED:", booking);
    return res.status(201).json(booking);

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("rentalItem");
    return res.json(bookings);
  } catch (error) {
    console.log("GET MY BOOKINGS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getBookingsForMyRentals = async (req, res) => {
  try {
    const myRentals = await RentalItem.find({ owner: req.user._id });
    console.log("Owner Rental IDs:", myRentals.map(r => r._id));
    if (myRentals.length === 0) {
      return res.json([]); // No rentals = no bookings possible
    }
    const rentalIds = myRentals.map(rental => rental._id);

    const bookings = await Booking.find({
      rentalItem: { $in: rentalIds },
    })
      .populate("user", "name email")
      .populate("rentalItem", "title location pricePerHour image")
      .sort({ createdAt: -1 });
      console.log(`Found ${bookings.length} bookings for this owner.`);
    return res.json(bookings);
  } catch (error) {
    console.log("OWNER BOOKINGS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getOwnerRevenue = async (req, res) => {
  try {
    const myRentals = await RentalItem.find({ owner: req.user._id });
    const rentalIds = myRentals.map(r => r._id);

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

    return res.json({
      totalBookings: bookings.length,
      activeBookings,
      cancelledBookings,
      totalRevenue,
    });
  } catch (error) {
    console.log("REVENUE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id.trim();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

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

export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking cannot be confirmed" });
    }

    if (booking.expiresAt && booking.expiresAt < new Date()) {
      booking.status = "expired";
      await booking.save();
      return res.status(400).json({ message: "Booking has expired" });
    }

    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();

    return res.json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};