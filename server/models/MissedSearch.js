import mongoose from "mongoose";

const missedSearchSchema = new mongoose.Schema(
  {
    searchQuery: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      default: "All",
    },
    searchCount: {
      type: Number,
      default: 1,
    },
    notifiedOwners: [
      {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notifiedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

missedSearchSchema.index({ searchQuery: 1, location: 1 });

export default mongoose.model("MissedSearch", missedSearchSchema);