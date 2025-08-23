import mongoose from "mongoose";

// Support both DATABASE_URL and MONGODB_URI for flexibility
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the DATABASE_URL or MONGODB_URI environment variable inside .env.local");
}

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: MongooseGlobal | undefined;
}

// Initialize cached connection
const cached: MongooseGlobal = global._mongooseConn ?? { conn: null, promise: null };
global._mongooseConn = cached;

async function dbConnect() {
  if (cached.conn) {
    console.log("DB - Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("DB - Creating new connection...");
    const opts = { 
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log("DB - Connected Successfully");
      return mongoose;
    }).catch((error) => {
      console.error("DB - Connection failed:", error);
      cached.promise = null; // Reset promise on error
      throw error;
    });
  }

  try {
    console.log("DB - Waiting for connection...");
    cached.conn = await cached.promise;
    console.log("DB - Connection established");
  } catch (e) {
    console.error("DB - Error establishing connection:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;