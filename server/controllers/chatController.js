import ChatRoom from "../models/ChatRoom.js";
import ChatMessage from "../models/ChatMessage.js";

export const getOrCreateChatRoom = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }

    if (currentUserId.toString() === participantId.toString()) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [currentUserId, participantId] }
    }).populate("participants", "name email");

    if (!chatRoom) {
      chatRoom = await ChatRoom.create({
        participants: [currentUserId, participantId]
      });
      chatRoom = await chatRoom.populate("participants", "name email");
    }

    res.json(chatRoom);
  } catch (error) {
    console.error("GET OR CREATE CHAT ROOM ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getChatRooms = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const rooms = await ChatRoom.find({
      participants: currentUserId
    }).populate("participants", "name email");

    // Calculate unread messages count for each room
    const roomsWithUnread = await Promise.all(rooms.map(async (room) => {
      const unreadCount = await ChatMessage.countDocuments({
        chatRoom: room._id,
        sender: { $ne: currentUserId },
        read: false
      });
      return {
        ...room.toObject(),
        unreadCount
      };
    }));

    res.json(roomsWithUnread);
  } catch (error) {
    console.error("GET CHAT ROOMS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await ChatMessage.find({ chatRoom: roomId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("GET CHAT MESSAGES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    await ChatMessage.updateMany(
      { chatRoom: roomId, sender: { $ne: currentUserId }, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("MARK MESSAGES AS READ ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
