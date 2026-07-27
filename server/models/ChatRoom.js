import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // [Borrower, Lender]
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }, // Optional: Link to a specific booking
}, { timestamps: true });

export default mongoose.model("ChatRoom", chatRoomSchema);
