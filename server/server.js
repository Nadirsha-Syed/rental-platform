import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingRoutes);
app.use("/api/rentals", rentalRoutes);
// auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Rental Platform API Running 🚀");
});

app.get("/test", (req, res) => {
  res.json({ message: "MY REAL SERVER" });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
