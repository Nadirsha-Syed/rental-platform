import "dotenv/config";
import mongoose from "mongoose";
import Booking from "./models/Booking.js";
import RentalItem from "./models/RentalItem.js";
import User from "./models/User.js"; // Register User schema
import { sendNewBookingEmail } from "./utils/sendEmail.js";

async function runTest() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected!");

  // Find all bookings and look for one with a valid rentalItem
  const bookings = await Booking.find().populate("rentalItem");
  const validBooking = bookings.find(b => b.rentalItem !== null);

  if (!validBooking) {
    console.log("No bookings with a valid non-null rentalItem found in DB.");
    mongoose.disconnect();
    return;
  }

  console.log("Found valid booking:", validBooking._id);
  const itemId = validBooking.rentalItem._id;
  console.log("Using Item ID:", itemId);

  const item = await RentalItem.findById(itemId).populate("owner", "name email");
  if (!item) {
    console.log("Rental item not found in DB.");
    mongoose.disconnect();
    return;
  }

  console.log("Item Title:", item.title);
  console.log("Lender Name:", item.owner?.name);
  console.log("Lender Email:", item.owner?.email);

  if (!item.owner?.email) {
    console.log("Lender has no email address. Cannot send email.");
    mongoose.disconnect();
    return;
  }

  console.log("Attempting to send email to lender...");
  try {
    const info = await sendNewBookingEmail(
      item.owner.email,
      item.owner.name,
      item.title,
      "Test Borrower",
      validBooking.totalPrice
    );
    console.log("Email sent successfully!", info);
  } catch (error) {
    console.error("Email send failed:", error);
  }

  mongoose.disconnect();
}

runTest().catch(console.error);
