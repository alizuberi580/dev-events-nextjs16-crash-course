import mongoose from 'mongoose';

// Define the shape of the cached connection object
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include our mongoose cache
declare global {
  var mongoose: MongooseCache | undefined;
}

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Initialize the cache on the global object
// This prevents multiple connections during hot reloads in development
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes and returns a cached MongoDB connection using Mongoose
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing connection promise if one is in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering
    };

    // Create new connection promise
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for connection to complete and cache it
    cached.conn = await cached.promise;
  } catch (e) {
    // Clear promise on error so next call will retry
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
