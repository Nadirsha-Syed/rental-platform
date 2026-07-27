import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getOrCreateChatRoom,
  getChatRooms,
  getChatMessages,
  markMessagesAsRead
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/rooms", protect, getOrCreateChatRoom);
router.get("/rooms", protect, getChatRooms);
router.get("/rooms/:roomId/messages", protect, getChatMessages);
router.put("/rooms/:roomId/read", protect, markMessagesAsRead);

export default router;
