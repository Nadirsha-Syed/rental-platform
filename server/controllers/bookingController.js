import Booking from "../models/Booking.js";
import RentalItem from "../models/RentalItem.js";
// 🔥 Import the mailing utility templates
import { 
  sendNewBookingEmail, 
  sendBookingConfirmedEmail, 
  sendBookingCancelledEmail 
} from "../utils/sendEmail.js";

// ✅ 1. Create Booking (With Pending & Confirmed conflict protection - NON-BLOCKING EMAIL)
export const createBooking = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { rentalItemId, startTime, endTime } = req.body;

    // Validation
    if (!rentalItemId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing booking data" });
    }

    // Populate the item owner details so we have their email address!
    const item = await RentalItem.findById(rentalItemId).populate("owner", "name email");
    if (!item) {
      return res.status(404).json({ message: "Rental item not found" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end - start) / (1000 * 60 * 60);

    if (hours <= 0) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // 🕒 TIME CONFLICT CHECK (Checks against both confirmed and pending bookings)
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

    // Calculate total
    const totalPrice = Math.round(hours * item.pricePerHour);

    // Create the booking
    const booking = await Booking.create({
      rentalItem: rentalItemId,
      user: req.user._id,
      startTime: start,
      endTime: end,
      totalPrice,
      status: "pending", 
    });

    console.log("BOOKING CREATED (PENDING APPROVAL):", booking);
    
    // 🔥 OPTIMIZATION: Send the success response immediately to the frontend!
    res.status(201).json(booking);

    // 🔥 Run email out-of-band in the background without holding up the user response
    sendNewBookingEmail(
      item.owner.email,
      item.owner.name,
      item.title,
      req.user.name,
      totalPrice
    ).catch((mailErr) => console.error("⚠️ Background Mail Error (Create Booking):", mailErr.message));

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// ✅ 2. Get My Bookings (Borrower Perspective - Deeply Populated for UI Tracking)
export const getMyBookings = async (req, res) => {
  try {
    // Queries all bookings initiated by the logged-in user
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "rentalItem",
        select: "title pricePerHour image location owner",
        populate: {
          path: "owner",
          select: "name email", // Grants access to 'booking.rentalItem.owner.email' on frontend
        },
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.log("GET MY BOOKINGS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 3. Get Bookings for My Rentals (Lender Perspective)
export const getBookingsForMyRentals = async (req, res) => {
  try {
    const myRentals = await RentalItem.find({ owner: req.user._id });
    if (myRentals.length === 0) {
      return res.json([]);
    }
    const rentalIds = myRentals.map(rental => rental._id);

    const bookings = await Booking.find({
      rentalItem: { $in: rentalIds },
    })
      .populate("user", "name email")
      .populate("rentalItem", "title location pricePerHour image owner")
      .sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.log("OWNER BOOKINGS ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ 4. Get Owner Revenue (Strictly confirmed counts)
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
    let pendingBookings = 0;

    bookings.forEach((booking) => {
      if (booking.status === "confirmed") {
        totalRevenue += booking.totalPrice; 
        activeBookings++;
      } else if (booking.status === "pending") {
        pendingBookings++;
      } else if (booking.status === "cancelled") {
        cancelledBookings++;
      }
    });

    return res.json({
      totalBookings: bookings.length,
      activeBookings, 
      cancelledBookings,
      pendingBookings,
      totalRevenue,
    });
  } catch (error) {
    console.log("REVENUE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ 5. Cancel/Reject Booking (NON-BLOCKING EMAIL)
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id.trim();
    const booking = await Booking.findById(bookingId).populate("rentalItem").populate("user", "name email");

  if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isBorrower = booking.user.toString() === req.user._id.toString();
    
    // Extract item details and populate asset owner attributes dynamically
    const itemWithOwner = await RentalItem.findById(booking.rentalItem._id).populate("owner", "name email");
    const isOwner = itemWithOwner.owner._id.toString() === req.user._id.toString();

    if (!isBorrower && !isOwner) {
      return res.status(403).json({ message: "Not authorized to reject or cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    // 🔥 OPTIMIZATION: Return data back to client immediately
    res.json({ message: "Booking cancelled successfully", booking });

    // 🔥 Run cancellation alert emails out-of-band in the background
    if (isOwner) {
      // Owner rejected it -> alert borrower
      sendBookingCancelledEmail(booking.user.email, booking.user.name, itemWithOwner.title, "borrower")
        .catch((mailErr) => console.error(" Background Mail Error (Reject Notification):", mailErr.message));
    } else if (isBorrower) {
      // Borrower withdrew request -> alert owner
      sendBookingCancelledEmail(itemWithOwner.owner.email, itemWithOwner.owner.name, itemWithOwner.title, "owner")
        .catch((mailErr) => console.error(" Background Mail Error (Cancel Notification):", mailErr.message));
    }

  } catch (error) {
    console.log("CANCEL ERROR:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// ✅ 6. Confirm Booking (Owner Direct Action - NON-BLOCKING EMAIL)
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("rentalItem").populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.rentalItem.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to confirm this booking" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking cannot be confirmed (not in pending state)" });
    }

    if (booking.expiresAt && booking.expiresAt < new Date()) {
      booking.status = "expired";
      await booking.save();
      return res.status(400).json({ message: "Booking has expired" });
    }

    booking.status = "confirmed";
    await booking.save();

    // 🔥 OPTIMIZATION: Return success response to the client immediately
    res.json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });

    // 🔥 Run confirmation email out-of-band in background task loop
    sendBookingConfirmedEmail(
      booking.user.email,
      booking.user.name,
      booking.rentalItem.title,
      booking.totalPrice,
      req.user.email // Lender email address string
    ).catch((mailErr) => console.error("⚠️ Background Mail Error (Confirm Booking):", mailErr.message));

  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};