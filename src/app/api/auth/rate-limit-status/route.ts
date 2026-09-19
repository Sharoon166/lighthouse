import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "127.0.0.1";
}

/**
 * GET — Check if the requesting IP is currently rate-limited.
 * POST — Record a failed login attempt for the requesting IP.
 *
 * Uses MongoDB with a TTL index for automatic cleanup.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const db = await connectToDatabase().then(() => {
    const { connection } = require("mongoose");
    return connection.db;
  });

  const collection = db.collection("loginAttempts");

  const record = await collection.findOne({ ip });

  if (!record) {
    return NextResponse.json({
      locked: false,
      remainingMs: 0,
      remainingAttempts: MAX_ATTEMPTS,
    });
  }

  // Check if lockout has expired
  if (record.lockedUntil && Date.now() > record.lockedUntil.getTime()) {
    await collection.deleteOne({ ip });
    return NextResponse.json({
      locked: false,
      remainingMs: 0,
      remainingAttempts: MAX_ATTEMPTS,
    });
  }

  if (record.lockedUntil) {
    return NextResponse.json({
      locked: true,
      remainingMs: record.lockedUntil.getTime() - Date.now(),
      remainingAttempts: 0,
    });
  }

  return NextResponse.json({
    locked: false,
    remainingMs: 0,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.count),
  });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const db = await connectToDatabase().then(() => {
    const { connection } = require("mongoose");
    return connection.db;
  });

  const collection = db.collection("loginAttempts");

  const now = new Date();
  const record = await collection.findOne({ ip });

  // If already locked out, don't increment
  if (record?.lockedUntil && now < record.lockedUntil) {
    return NextResponse.json({
      locked: true,
      remainingMs: record.lockedUntil.getTime() - now.getTime(),
      remainingAttempts: 0,
    });
  }

  // If lockout expired, reset
  if (record?.lockedUntil && now >= record.lockedUntil) {
    await collection.deleteOne({ ip });
  }

  const newCount = (record?.count || 0) + 1;

  if (newCount >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(now.getTime() + LOCKOUT_MS);
    await collection.updateOne(
      { ip },
      { $set: { count: newCount, lockedUntil, updatedAt: now } },
      { upsert: true },
    );
    return NextResponse.json({
      locked: true,
      remainingMs: LOCKOUT_MS,
      remainingAttempts: 0,
    });
  }

  await collection.updateOne(
    { ip },
    { $set: { count: newCount, updatedAt: now }, $unset: { lockedUntil: "" } },
    { upsert: true },
  );

  return NextResponse.json({
    locked: false,
    remainingMs: 0,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - newCount),
  });
}
