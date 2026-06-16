import Booking from "../models/Booking.js";
import RentalItem from "../models/RentalItem.js";
// 🔥 ONLY NECESSARY ADDITION: Import the mailing utility templates
import { 
  sendNewBookingEmail, 
  sendBookingConfirmedEmail, 
  sendBookingCancelledEmail 
} from "../utils/sendEmail.js";

// ✅ 1. Create Booking (With Pending & Confirmed conflict protection)
export const createBooking = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { rentalItemId, startTime, endTime } = req.body;

    // Validation
    if (!rentalItemId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing booking data" });
    }

    // 🔥 MODIFIED: Populate the item owner details so we have their email address!
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

    // 🕒 TIME CONFLICT CHECK (Only check against already confirmed bookings)
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

    // 🔥 MODIFIED: Safely trigger background alert notification to owner
    try {
      await sendNewBookingEmail(
        item.owner.email,
        item.owner.name,
        item.title,
        req.user.name,
        totalPrice
      );
    } catch (mailErr) {
      console.error("Background Mail Error (Create Booking):", mailErr.message);
    }

    console.log("BOOKING CREATED (PENDING APPROVAL):", booking);
    return res.status(201).json(booking);

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ 2. Get My Bookings (Borrower Perspective)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("rentalItem");
    return res.json(bookings);
  } catch (error) {
    console.log("GET MY BOOKINGS ERROR:", error);
    return res.status(500).json({ message: error.message });
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

// ✅ 5. Cancel/Reject Booking
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id.trim();
    // 🔥 MODIFIED: Populated 'user' data right away to capture borrower information for email template context 
    const booking = await Booking.findById(bookingId).populate("rentalItem").populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isBorrower = booking.user.toString() === req.user._id.toString();
    
    // 🔥 MODIFIED: Extract item details and populate asset owner attributes dynamically
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

    // 🔥 MODIFIED: Send contextual notification loops based on who did the cancellation action
    try {
      if (isOwner) {
        // Owner rejected it -> alert borrower
        await sendBookingCancelledEmail(booking.user.email, booking.user.name, itemWithOwner.title, "borrower");
      } else if (isBorrower) {
        // Borrower withdrew request -> alert owner
        await sendBookingCancelledEmail(itemWithOwner.owner.email, itemWithOwner.owner.name, itemWithOwner.title, "owner");
      }
    } catch (mailErr) {
      console.error("Background Mail Error (Cancel Booking):", mailErr.message);
    }

    return res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.log("CANCEL ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ 6. Confirm Booking (Owner Direct Action)
export const confirmBooking = async (req, res) => {
  try {
    // 🔥 MODIFIED: Populated 'user' data field strings to obtain recipient borrower target context strings
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
    booking.paymentStatus = "paid"; 
    await booking.save();

    // 🔥 MODIFIED: Fire approval congratulations response directly to client mailbox 
    try {
      await sendBookingConfirmedEmail(
        booking.user.email,
        booking.user.name,
        booking.rentalItem.title,
        booking.totalPrice,
        req.user.email // Lender logged-in email context string
      );
    } catch (mailErr) {
      console.error("Background Mail Error (Confirm Booking):", mailErr.message);
    }

    return res.json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};