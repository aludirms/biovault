import mongoose from "mongoose";

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/biovault";
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[BioVault DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[BioVault DB] MongoDB connection not available (${error.message}).`);
    console.log(`[BioVault DB] Running with BioVault Persistent In-Memory Data Store.`);
  }
};

export const getDBStatus = () => isMongoConnected;
