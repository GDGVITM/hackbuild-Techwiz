import mongoose from "mongoose";
import '../models'; // Import all models to ensure they are registered
import ensureModelsRegistered from '../models/register';

const MONGODB_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/hackbuild-techwiz";

if (!MONGODB_URI) {
  console.warn("DATABASE_URL not found, using default local MongoDB connection");
}

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // allow global `mongoose` in Node.js
  // eslint-disable-next-line no-var
  var mongoose: MongooseGlobal | undefined;
}

// Always initialize cached
const cached: MongooseGlobal = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

async function dbConnect() {
  if (cached.conn) {
    console.log("Using cached database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new database connection...");
    const opts = { bufferCommands: false };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then(async (mongoose) => {
      console.log("DB connected Successfully");
      
      // Ensure all models are registered
      await ensureModelsRegistered();
      
      console.log("Available models:", Object.keys(mongoose.connection.models));
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error("Database connection error:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
