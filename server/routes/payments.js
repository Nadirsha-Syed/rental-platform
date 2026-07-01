import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/Booking.js";
import RentalItem from "../models/RentalItem.js";
import { sendNewBookingEmail, sendBookingConfirmedEmail } from "../utils/sendEmail.js";

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create a new order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, itemId, borrowerName } = req.body; 

    // Asynchronously trigger New Booking email to Lender/Owner
    if (itemId && borrowerName) {
      RentalItem.findById(itemId)
        .populate("owner", "name email")
        .then((item) => {
          if (item && item.owner) {
            sendNewBookingEmail(
              item.owner.email,
              item.owner.name,
              item.title,
              borrowerName,
              amount
            ).catch((err) => console.error("⚠️ Email dispatch failure on order creation:", err.message));
          }
        })
        .catch((err) => console.error("⚠️ Database query failure during item owner retrieval:", err.message));
    }

    const options = {
      amount: amount * 100, // Razorpay processes amounts in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Route to verify the payment signature
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing Razorpay verification tokens" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      if (bookingId) {
        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { paymentStatus: "paid" },
          { new: true }
        )
        .populate("user", "name email")
        .populate({
          path: "rentalItem",
          populate: { path: "owner", select: "name email" }
        });

        if (!updatedBooking) {
          console.warn(`Booking with ID ${bookingId} not found during payment status update.`);
        } else {
          console.log(`Booking ${bookingId} successfully updated to paid.`);
          
          // Asynchronously dispatch receipt/invoice confirmation to Borrower
          if (updatedBooking.user && updatedBooking.rentalItem && updatedBooking.rentalItem.owner) {
            sendBookingConfirmedEmail(
              updatedBooking.user.email,
              updatedBooking.user.name,
              updatedBooking.rentalItem.title,
              updatedBooking.totalPrice,
              updatedBooking.rentalItem.owner.email
            ).catch((err) => console.error("⚠️ Email dispatch failure on payment confirmation:", err.message));
          }
        }
      }
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment verification failure:", error);
    res.status(500).json({ success: false, message: "Internal server verification error" });
  }
});

export default router;