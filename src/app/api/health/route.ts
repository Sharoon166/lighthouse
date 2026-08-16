import { NextResponse } from "next/server";

import { connectToDatabase, getDatabaseState } from "@/lib/db";

export async function GET() {
  try {
    await connectToDatabase();

    return NextResponse.json({
      status: "ok",
      database: getDatabaseState(),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: getDatabaseState(),
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
