import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import clientPromise from "./lib/mongodb";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/admin/setup") {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // // Validate session still exists in DB (catches revoked/blocked users)
  // try {
  //   const client = await clientPromise;
  //   const db = client.db();
  //   const session = await db.collection("session").findOne({ token: sessionCookie });

  //   if (!session) {
  //     const loginUrl = new URL("/admin/login", request.url);
  //     loginUrl.searchParams.set("from", pathname);
  //     const response = NextResponse.redirect(loginUrl);
  //     response.cookies.delete("session_token");
  //     return response;
  //   }

  //   // Check if session expired
  //   if (new Date(session.expiresAt) < new Date()) {
  //     const loginUrl = new URL("/admin/login", request.url);
  //     loginUrl.searchParams.set("from", pathname);
  //     const response = NextResponse.redirect(loginUrl);
  //     response.cookies.delete("session_token");
  //     return response;
  //   }

  //   // Check if user is blocked
  //   const user = await db.collection("user").findOne(
  //     { _id: session.userId },
  //     { projection: { blocked: 1 } },
  //   );

  //   if (user?.blocked) {
  //     // Revoke all sessions for blocked user
  //     await db.collection("session").deleteMany({ userId: session.userId });
  //     const loginUrl = new URL("/admin/login", request.url);
  //     loginUrl.searchParams.set("from", pathname);
  //     const response = NextResponse.redirect(loginUrl);
  //     response.cookies.delete("session_token");
  //     return response;
  //   }
  // } catch {
  //   // If DB check fails, allow through (better than locking everyone out)
  //   // The session cookie check above already passed
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
