const mongoose = require("mongoose");

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
  enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
  default: "pending"
},
expiresAt: {
  type: Date
},
paymentStatus: {
  type: String,
  enum: ["unpaid", "paid", "failed", "refunded"],
  default: "unpaid"
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
