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
app.use(express.json());

// 🔒 HIGH-PERFORMANCE CORS SECURITY PRODUCTION BUILD
// Dynamically accepts requests from your local machine or your live production frontend site link
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean); // Cleans out undefined strings if FRONTEND_URL is not configured yet

app.use(
  cors({
    origin: function (origin, callback) {
      // Allows serverless environments, Postman API calls, or server-to-server pings with no origin
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const message = "The CORS security standard restricts cross-origin visibility from this resource location.";
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// 🛣️ Registered Routing Middleware Endpoints
app.use("/api/bookings", bookingRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Root Deployment Test Routes
app.get("/", (req, res) => {
  res.send("Rental Platform API Running 🚀 Status: Healthy");
});

app.get("/test", (req, res) => {
  res.json({ message: "MY REAL SERVER" });
});

// 🌍 Dynamic Cloud Port Binding
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server successfully executing on active port configuration: ${PORT}`);
});