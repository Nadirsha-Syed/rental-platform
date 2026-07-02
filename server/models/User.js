import mongoose from "mongoose"; // 🔄 Switched to ES Module import to match backend setup

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },
    isApproved: {
      type: Boolean,
      default: false, // useful later for vendors
    },
    // 💰 WALLET LEDGER: Tracks virtual earnings for P2P manual settlements
    walletBalance: {
      type: Number,
      default: 0, // Initial balance starts at zero rupees
    },
  },
  { timestamps: true }
);

// 🔄 Switched to ES Module default export
export default mongoose.model("User", userSchema);