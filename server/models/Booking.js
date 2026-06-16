import mongoose from "mongoose"; // 🔥 Switched to ES Module import

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rentalItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalItem",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      // 🟢 "pending" -> Owner needs to Accept/Reject
      // 🟢 "confirmed" -> Owner approved it
      // 🟢 "cancelled" -> Owner rejected it or borrower backed out
      enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

// 🔥 Switched to ES Module default export
export default mongoose.model("Booking", bookingSchema);