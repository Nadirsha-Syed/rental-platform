import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import paymentRoutes from "./routes/payments.js";
import ChatMessage from "./models/ChatMessage.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

connectDB();

const app = express();
app.use(express.json());

const corsOriginChecker = (origin, callback) => {
  if (!origin) return callback(null, true);
  const cleanOrigin = origin.replace(/\/$/, "");
  const isLocalhost = cleanOrigin.startsWith("http://localhost:");
  const isVercelDomain = cleanOrigin.endsWith("vercel.app") && cleanOrigin.includes("rental-platform");

  if (isLocalhost || isVercelDomain) {
    return callback(null, true);
  } else {
    const message = `The CORS security standard restricts cross-origin visibility from this resource location: ${origin}`;
    return callback(new Error(message), false);
  }
};

app.use(
  cors({
    origin: corsOriginChecker,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

app.use("/api/bookings", bookingRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);


app.get("/", (req, res) => {
  res.send("Rental Platform API Running 🚀 Status: Healthy");
});

app.get("/test", (req, res) => {
  res.json({ message: "MY REAL SERVER" });
});

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: corsOriginChecker,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send_message", async (data) => {
    try {
      const { chatRoomId, senderId, text } = data;
      const message = await ChatMessage.create({
        chatRoom: chatRoomId,
        sender: senderId,
        text
      });
      const populatedMessage = await message.populate("sender", "name email");
      io.to(chatRoomId).emit("receive_message", populatedMessage);
    } catch (err) {
      console.error("Error handling send_message:", err.message);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server successfully executing on active port configuration: ${PORT}`);
});