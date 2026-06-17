import Booking from "../models/Booking.js";
import RentalItem from "../models/RentalItem.js";
import { sendNewBookingEmail } from "../utils/sendEmail.js"; // 🔥 Ensure this import is at the top of your file

export const createBooking = async (req, res) => {
  try {
    const { rentalItemId, startTime, endTime } = req.body;

    if (!rentalItemId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing booking data" });
    }

    // 🔥 FIX 1: Populate the item's owner field so we can extract their email and name for Nodemailer
    const rentalItem = await RentalItem.findById(rentalItemId).populate("owner", "name email");

    if (!rentalItem) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // 🔥 FIX 2: Check against BOTH confirmed and pending statuses to eliminate double-booking race conditions
    const conflictingBooking = await Booking.findOne({
      rentalItem: rentalItemId,
      status: { $in: ["confirmed", "pending"] }, 
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (conflictingBooking) {
      return res.status(400).json({
        message: conflictingBooking.status === "confirmed"
          ? "This rental is already confirmed for the selected time range."
          : "You already have a pending booking request for this time slot. Please wait for owner approval.",
      });
    }

    const totalPrice = Math.round(hours * rentalItem.pricePerHour);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const booking = await Booking.create({
      rentalItem: rentalItemId,
      user: req.user._id,
      startTime: start,
      endTime: end,
      totalPrice,
      status: "pending", 
      expiresAt
    });

    // 🔥 FIX 3: Non-blocking Fire-and-Forget background email execution.
    // We send the JSON response instantly to the user, then let the email send out-of-band.
    res.status(201).json(booking);

    // Runs asynchronously in the background loop without making the user wait
    sendNewBookingEmail(
      rentalItem.owner.email,
      rentalItem.owner.name,
      rentalItem.title,
      req.user.name, // Logged-in customer name
      totalPrice
    ).catch((mailErr) => console.error("⚠️ Background Notification Error:", mailErr.message));

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    // Safety check: Avoid trying to send headers twice if response was already dispatched above
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};