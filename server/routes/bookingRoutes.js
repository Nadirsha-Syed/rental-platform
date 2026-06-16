import express from "express";
import { 
  createBooking, 
  cancelBooking, 
  getMyBookings, 
  getBookingsForMyRentals, 
  getOwnerRevenue, 
  confirmBooking 
} from "../controllers/bookingController.js"; // ⚠️ Note the .js extension for ES Modules
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🎫 1. General Booking & Borrower Routes
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);

// 🎛️ 2. Owner Approval Handlers (PUT endpoints)
router.put("/:id/confirm", protect, confirmBooking);
router.put("/:id/cancel", protect, cancelBooking);

// 📊 3. Owner/P2P Dashboard Aggregations
// Removed 'authorizeRoles' middleware so any registered user can naturally act as a lender
router.get("/owner-bookings", protect, getBookingsForMyRentals);
router.get("/owner-revenue", protect, getOwnerRevenue);

export default router;