import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/riwaaz";
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB connected successfully: ${connection.connection.host}`);
  } catch (error) {
    console.error("⚠️ MongoDB Atlas connection error:", error.message);
    try {
      console.log("🔄 Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/riwaaz)...");
      const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/riwaaz", {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`✅ Fallback local MongoDB connected: ${localConn.connection.host}`);
    } catch (localError) {
      console.error("⚠️ Database connection unavailable. Make sure your IP is whitelisted on MongoDB Atlas or run local MongoDB.");
    }
  }
};

export default connectDB;