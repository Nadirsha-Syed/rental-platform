import mongoose from "mongoose";

const searchNotificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    searchQuery: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    location: {
      type: String,
      default: "All",
    },
    notifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

searchNotificationSchema.index({ owner: 1, searchQuery: 1, location: 1 });

searchNotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model("SearchNotification", searchNotificationSchema);