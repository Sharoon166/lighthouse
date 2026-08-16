import mongoose from "mongoose";

import { env } from "@/lib/env";

const MONGODB_URI = env.MONGODB_URI;

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost");
});

type MongooseCache = {
  promise: Promise<typeof mongoose> | null;
};

const globalForDb = globalThis as unknown as {
  mongooseConnection?: MongooseCache;
};

const cached: MongooseCache = globalForDb.mongooseConnection ?? {
  promise: null,
};

globalForDb.mongooseConnection = cached;

export function getDatabaseState():
  | "connected"
  | "connecting"
  | "disconnecting"
  | "disconnected"
  | "uninitialized" {
  const readyState = mongoose.connection.readyState;

  switch (readyState) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "uninitialized";
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 10_000,
        socketTimeoutMS: 45_000,
      })
      .catch((error) => {
        cached.promise = null;
        console.error("Failed to connect to MongoDB:", error);
        throw error;
      });
  }

  return cached.promise;
}
