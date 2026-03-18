import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Check if the URI is actually being loaded
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file!");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // This log will tell you if you're in 'test' (Pulsar) or something else
    console.log(`📂 Database Name: ${conn.connection.name}`); 
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;