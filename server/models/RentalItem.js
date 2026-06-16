import mongoose from "mongoose";

const rentalItemSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    category: {
  type: String,
  required: true,
  // 🔽 Update this array to match your new frontend dropdowns exactly!
  enum: ["Electronics", "Bikes", "Books", "Tools"] 
},

    description: {
      type: String,
      required: true,
    },

    pricePerHour: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ ES Module Export
const RentalItem = mongoose.model("RentalItem", rentalItemSchema);
export default RentalItem;