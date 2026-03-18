import dotenv from "dotenv";
dotenv.config(); // Force load variables before any other imports

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Test Routes
app.get("/", (req, res) => {
  res.send("Rental Platform API Running 🚀");
});

app.get("/test", (req, res) => {
  res.json({ message: "MY REAL SERVER" });
});

const PORT = process.env.PORT || 5000;

// ✅ Improved Startup: Connect to DB FIRST, then start server
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();