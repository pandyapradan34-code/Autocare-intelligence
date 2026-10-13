import mongoose from "mongoose";

let isDbConnected = false;

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/autocare";
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isDbConnected = true;
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.warn("MongoDB connection failed, falling back to memory store:", err.message);
    isDbConnected = false;
  }
};

export const isConnected = () => isDbConnected;