// * This file creates and manages ONE MongoDB connection using Mongoose which prevents multiple connections during Next.js hot reloads


//Imports Mongoose, a MongoDB ODM (Object Data Modeling) library which lets connect to db define schemas and query the db easily
import mongoose from 'mongoose';

// Define the connection cache type.
/* WHY? because we want to remember if we already connected or if a connection is in progress, to avoid duplicate cons
* conn --> stores the actual connected mongoose instance
* typeof mongoose --> The type of the mongoose object itself defined
* promise --> Stores the ongoing connection promise
*/
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};



// Extend the global object to include our mongoose cache
/* WHY? in dev mode files may reload multi times, w/o global it connects many times
* */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// reading conn string from .env.local
const MONGODB_URI = process.env.MONGODB_URI;


// Initialize the cache on the global object to persist across hot reloads in development
/* WHY? If global.mongoose exists → reuse it
   Otherwise → create a new empty cache. This is the heart of the connection reuse logic.
* */
//cached mein global.mongoose ko assign kar rahe hain, agar woh null hai toh ek naya object de rahe hain jisme conn aur promise dono null hain
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

/* WHY? ensures cache lives globally
* */
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to prevent multiple connections during development hot reloads.
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing connection promise if one is in progress
  if (!cached.promise) {
    // Validate MongoDB URI exists
    if (!MONGODB_URI) {
      throw new Error(
          'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }
    const options = {
      bufferCommands: false, // Disable Mongoose buffering
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for the connection to establish
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;