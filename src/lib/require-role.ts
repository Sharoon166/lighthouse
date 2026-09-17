import "server-only";

import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export const getCurrentSession = cache(async () => {
  return await auth.api.getSession({ headers: await headers() });
});

export async function requireRole(roles: readonly string[]) {
  const session = await getCurrentSession();
  if (!session) redirect("/admin/login");

  const userRole = session.user.role as string;
  if (!roles.includes(userRole)) redirect("/admin");

  // Check if user is blocked
  const db = (await clientPromise).db();
  const user = await db
    .collection("user")
    .findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { blocked: 1 } },
    );

  if (user?.blocked) {
    // Attempt to revoke sessions — may fail if the blocked user's own
    // session lacks permission. That's fine; we still redirect.
    try {
      await auth.api.revokeUserSessions({
        headers: await headers(),
        body: { userId: session.user.id },
      });
    } catch {
      // Session revocation failed (e.g. 403 FORBIDDEN).
      // The redirect below will still invalidate the cookie.
    }
    redirect("/admin/login?blocked=1");
  }

  return session;
}

export function requireAdmin() {
  return requireRole(["admin"]);
}

export function requireDashboardAccess() {
  return requireRole(["admin", "staff"]);
}
