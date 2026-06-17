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

// 🔥 THE ADDITION: Create a Compound Text Index for optimized matching
// This operates strictly behind the scenes in MongoDB without changing document schemas.
rentalItemSchema.index(
  { 
    title: "text", 
    location: "text",
    description: "text"
  }, 
  {
    weights: {
      title: 10,       // Matches found in the Title carry the highest priority match score
      location: 5,     // Regional matching queries get secondary relevance scoring
      description: 2   // Fallback keyword descriptions carry normal priority weighting
    },
    name: "MarketplaceSearchIndex" // Internal registration tag identifier for Atlas
  }
);

// ✅ ES Module Export
const RentalItem = mongoose.model("RentalItem", rentalItemSchema);
export default RentalItem;