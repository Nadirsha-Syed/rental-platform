import Booking from "../models/Booking.js";
import RentalItem from "../models/RentalItem.js";
import User from "../models/User.js"; // 💰 Added User import to increment wallet balances

// 🔥 Import the mailing utility templates
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
    const currentUserId = req.user?._id || req.user?.id;

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
      user: currentUserId,
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
      req.user?.name || "A User",
      totalPrice
    ).catch((mailErr) => console.error("⚠️ Background Mail Error (Create Booking):", mailErr.message));

  } catch (error) {
    console.log("BOOKING ERROR:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// ✅ 2. Get My Bookings (Borrower Perspective - Fallback Safe ID Assignment)
export const getMyBookings = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.user?.id;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "User context not identified." });
    }

    // Queries all bookings initiated by the logged-in user
    const bookings = await Booking.find({ user: currentUserId })
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
    const currentUserId = req.user?._id || req.user?.id;
    const myRentals = await RentalItem.find({ owner: currentUserId });
    
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
    const currentUserId = req.user?._id || req.user?.id;
    const myRentals = await RentalItem.find({ owner: currentUserId });
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

// ✅ 5. Cancel/Reject Booking (Fixed Wallet Balance Leak)
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id.trim();
    const currentUserId = req.user?._id || req.user?.id;
    
    const booking = await Booking.findById(bookingId).populate("rentalItem").populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const borrowerId = booking.user?._id || booking.user;
    const isBorrower = borrowerId && borrowerId.toString() === currentUserId.toString();
    
    const itemWithOwner = await RentalItem.findById(booking.rentalItem._id).populate("owner", "name email");
    if (!itemWithOwner) {
      return res.status(404).json({ message: "Associated rental item missing" });
    }
    const isOwner = itemWithOwner.owner._id.toString() === currentUserId.toString();

    // Verification Guard
    if (!isBorrower && !isOwner) {
      return res.status(403).json({ message: "Not authorized to reject or cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // 💰 FIXED: If a confirmed booking drops out, ALWAYS claw back balance from lender wallet, regardless of who pressed cancel.
    if (booking.status === "confirmed") {
      await User.findByIdAndUpdate(itemWithOwner.owner._id, {
        $inc: { walletBalance: -booking.totalPrice }
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });

    // 🔥 Background Mail Tasks
    if (isOwner) {
      sendBookingCancelledEmail(booking.user.email, booking.user.name, itemWithOwner.title, "borrower")
        .catch((mailErr) => console.error("⚠️ Background Mail Error (Reject Notification):", mailErr.message));
    } else if (isBorrower) {
      sendBookingCancelledEmail(itemWithOwner.owner.email, itemWithOwner.owner.name, itemWithOwner.title, "owner")
        .catch((mailErr) => console.error("⚠️ Background Mail Error (Cancel Notification):", mailErr.message));
    }

  } catch (error) {
    console.log("CANCEL ERROR:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};

// ✅ 6. Confirm Booking (Owner Direct Action - Credits Lender Wallet & Fires Email)
export const confirmBooking = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.user?.id;
    // Deeply populate the embedded rental item owner to draw verification fallback hooks safely
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "rentalItem",
        populate: { path: "owner", select: "email name" }
      })
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const lenderId = booking.rentalItem?.owner?._id || booking.rentalItem?.owner;
    if (!lenderId || lenderId.toString() !== currentUserId.toString()) {
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

    // 💰 LEDGER UPDATE: Credit the lender's walletBalance directly!
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { walletBalance: booking.totalPrice }
    });

    res.json({
      success: true,
      message: "Booking confirmed successfully and earnings credited to wallet!",
      data: booking,
    });

    // 🛠️ OPTIMIZATION: Fallback to verified database records if middleware payload attributes drop string references
    const verifiedLenderEmail = booking.rentalItem?.owner?.email || req.user?.email || "lender@market.com";

    sendBookingConfirmedEmail(
      booking.user.email,
      booking.user.name,
      booking.rentalItem.title,
      booking.totalPrice,
      verifiedLenderEmail
    ).catch((mailErr) => console.error("⚠️ Background Mail Error (Confirm Booking):", mailErr.message));

  } catch (error) {
    console.log("CONFIRM BOOKING ERROR:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: error.message });
    }
  }
};