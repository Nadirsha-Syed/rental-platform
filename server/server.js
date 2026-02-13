const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const rentalRoutes = require("./routes/rentalRoutes");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const authRoutes = require("./routes/authRoutes");



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/rentals", rentalRoutes);
// auth Routes
app.use("/api/auth", authRoutes);


// Test Route
app.get("/", (req, res) => {
  res.send("Rental Platform API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
