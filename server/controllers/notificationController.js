import SearchNotification from "../models/SearchNotification.js";

export const getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;

    const notifications = await SearchNotification.find({ owner: currentUserId })
      .sort({ notifiedAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
