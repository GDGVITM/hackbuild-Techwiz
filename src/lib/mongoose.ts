import mongoose from "mongoose";

const MONGO_URI = process.env.DATABASE_URL;

if (!MONGO_URI) throw new Error("Missing MongoDB URI");

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI as string).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;