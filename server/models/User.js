const mongoose = require("mongoose"); // 🛠️ Fixed: Reverted to CommonJS require statement

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

// 🛠️ Fixed: Reverted to CommonJS module exports syntax
module.exports = mongoose.model("User", userSchema);