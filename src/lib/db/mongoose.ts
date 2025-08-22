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
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      console.log("DB connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;