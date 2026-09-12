"use server";

import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { getCurrentSession } from "@/lib/require-role";

export type StaffAccount = {
  id: string;
  name: string;
  email: string;
  role: "staff";
  createdAt: string;
  plainPassword: string | null;
  isOnline: boolean;
  isBlocked: boolean;
};

export type StaffActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

type AdminRole = "user" | "admin";

const STAFF_LIMIT = 1;

async function getAdminId() {
  const session = await getCurrentSession();
  if (!session) return null;
  const role = session.user.role as string;
  if (role !== "admin") return null;
  return session.user.id;
}

async function getDb() {
  return (await clientPromise).db();
}

async function findStaffAccount(userId: string) {
  const db = await getDb();
  const doc = await db
    .collection("user")
    .findOne({ _id: new ObjectId(userId) });
  if (!doc || doc.role !== "staff") return null;

  const activeSession = await db.collection("session").findOne({
    userId: new ObjectId(doc._id.toString()),
    expiresAt: { $gt: new Date() },
  });

  return {
    id: doc._id.toString(),
    name: (doc.name as string) ?? "",
    email: (doc.email as string) ?? "",
    role: "staff" as const,
    createdAt: new Date((doc.createdAt as string | Date) ?? 0).toISOString(),
    plainPassword: (doc.plainPassword as string | undefined) ?? null,
    isOnline: !!activeSession,
    isBlocked: Boolean(doc.blocked),
  };
}

async function setPlainPassword(userId: string, password: string) {
  const db = await getDb();
  await db
    .collection("user")
    .updateOne(
      { _id: new ObjectId(userId) },
      { $set: { plainPassword: password } },
    );
}

function apiErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    const message = err.message;
    if (/already exists/i.test(message)) {
      return "A user with this email already exists.";
    }
    return message;
  }
  return fallback;
}

export async function listStaffAccounts(): Promise<StaffAccount[]> {
  if (!(await getAdminId())) return [];

  const db = await getDb();
  const res = await auth.api.listUsers({
    headers: await headers(),
    query: {
      filterField: "role",
      filterValue: "staff",
      filterOperator: "eq",
      limit: 100,
    },
  });

  const users = res?.users ?? [];
  if (users.length === 0) return [];

  const docs = await db
    .collection("user")
    .find({ _id: { $in: users.map((u) => new ObjectId(u.id)) } })
    .toArray();
  const passwords = new Map(
    docs.map((d) => [d._id.toString(), d.plainPassword as string | undefined]),
  );
  const blockedUsers = new Set(
    docs.filter((d) => d.blocked).map((d) => d._id.toString()),
  );

  const activeSessions = await db
    .collection("session")
    .find({
      userId: { $in: users.map((u) => new ObjectId(u.id)) },
      expiresAt: { $gt: new Date() },
    })
    .toArray();
  const onlineUsers = new Set(activeSessions.map((s) => s.userId.toString()));

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: "staff" as const,
    createdAt: new Date((u.createdAt as string | Date) ?? 0).toISOString(),
    plainPassword: passwords.get(u.id) ?? null,
    isOnline: onlineUsers.has(u.id),
    isBlocked: blockedUsers.has(u.id),
  }));
}

const staffCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export async function createStaffAccount(
  input: unknown,
): Promise<StaffActionResult> {
  if (!(await getAdminId())) return { ok: false, message: "Unauthorized" };

  const parsed = staffCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { name, email, password } = parsed.data;

  const db = await getDb();
  const staffCount = await db
    .collection("user")
    .countDocuments({ role: "staff" });
  if (staffCount >= STAFF_LIMIT) {
    return {
      ok: false,
      message: `Only ${STAFF_LIMIT} staff account is allowed. Remove the existing staff member first.`,
    };
  }

  try {
    await auth.api.createUser({
      headers: await headers(),
      body: {
        email,
        name,
        password,
        role: "staff" as unknown as AdminRole,
      },
    });

    const doc = await db
      .collection("user")
      .findOne({ email: email.toLowerCase() });
    if (doc) {
      await db
        .collection("user")
        .updateOne({ _id: doc._id }, { $set: { plainPassword: password } });
    }

    return { ok: true, message: "Staff account created." };
  } catch (err) {
    return {
      ok: false,
      message: apiErrorMessage(err, "Failed to create staff account."),
    };
  }
}

const staffUpdateSchema = z.object({
  userId: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: z.email("Enter a valid email address"),
});

export async function updateStaffDetails(
  input: unknown,
): Promise<StaffActionResult> {
  if (!(await getAdminId())) return { ok: false, message: "Unauthorized" };

  const parsed = staffUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { userId, name, email } = parsed.data;
  const existing = await findStaffAccount(userId);
  if (!existing) return { ok: false, message: "Staff account not found." };

  const data: { name?: string; email?: string } = {};
  if (name !== existing.name) data.name = name;
  if (email.toLowerCase() !== existing.email.toLowerCase()) data.email = email;
  if (Object.keys(data).length === 0) {
    return { ok: true, message: "No changes to save." };
  }

  try {
    await auth.api.adminUpdateUser({
      headers: await headers(),
      body: { userId, data },
    });

    if (data.email) {
      await auth.api.revokeUserSessions({
        headers: await headers(),
        body: { userId },
      });
    }

    return {
      ok: true,
      message: data.email
        ? "Details updated. The staff member was signed out on all devices."
        : "Details updated.",
    };
  } catch (err) {
    return {
      ok: false,
      message: apiErrorMessage(err, "Failed to update staff account."),
    };
  }
}

const staffPasswordSchema = z.object({
  userId: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export async function setStaffPassword(
  input: unknown,
): Promise<StaffActionResult> {
  if (!(await getAdminId())) return { ok: false, message: "Unauthorized" };

  const parsed = staffPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { userId, password } = parsed.data;
  if (!(await findStaffAccount(userId))) {
    return { ok: false, message: "Staff account not found." };
  }

  try {
    await auth.api.setUserPassword({
      headers: await headers(),
      body: { userId, newPassword: password },
    });
    await setPlainPassword(userId, password);
    await auth.api.revokeUserSessions({
      headers: await headers(),
      body: { userId },
    });

    return {
      ok: true,
      message:
        "Password updated. The staff member was signed out on all devices.",
    };
  } catch (err) {
    return {
      ok: false,
      message: apiErrorMessage(err, "Failed to update password."),
    };
  }
}

const staffUserSchema = z.object({ userId: z.string().min(1) });

export async function deleteStaffAccount(
  input: unknown,
): Promise<StaffActionResult> {
  if (!(await getAdminId())) return { ok: false, message: "Unauthorized" };

  const parsed = staffUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { userId } = parsed.data;
  if (!(await findStaffAccount(userId))) {
    return { ok: false, message: "Staff account not found." };
  }

  try {
    await auth.api.removeUser({
      headers: await headers(),
      body: { userId },
    });
    return { ok: true, message: "Staff account deleted." };
  } catch (err) {
    return {
      ok: false,
      message: apiErrorMessage(err, "Failed to delete staff account."),
    };
  }
}

export async function revokeStaffSessions(
  input: unknown,
): Promise<StaffActionResult> {
  if (!(await getAdminId())) return { ok: false, message: "Unauthorized" };

  const parsed = staffUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { userId } = parsed.data;
  if (!(await findStaffAccount(userId))) {
    return { ok: false, message: "Staff account not found." };
  }

  try {
    await auth.api.revokeUserSessions({
      headers: await headers(),
      body: { userId },
    });
    return {
      ok: true,
      message: "Logged out this staff member on all devices.",
    };
  } catch (err) {
    return {
      ok: false,
      message: apiErrorMessage(err, "Failed to log out staff member."),
    };
  }
}

export async function revokeAllStaffSessions(): Promise<StaffActionResult> {
  if (!(await getAdminId())) return { ok: false, message: "Unauthorized" };

  try {
    const res = await auth.api.listUsers({
      headers: await headers(),
      query: {
        filterField: "role",
        filterValue: "staff",
        filterOperator: "eq",
        limit: 100,
      },
    });

    const staff = res?.users ?? [];
    for (const user of staff) {
      await auth.api.revokeUserSessions({
        headers: await headers(),
        body: { userId: user.id },
      });
    }

    return {
      ok: true,
      message:
        staff.length === 0
          ? "No staff accounts."
          : `Logged out ${staff.length} staff ${staff.length === 1 ? "member" : "members"} on all devices.`,
    };
  } catch (err) {
    return {
      ok: false,
      message: apiErrorMessage(err, "Failed to log out staff."),
    };
  }
}

const blockStaffSchema = z.object({ userId: z.string().min(1) });

export async function blockStaffAccount(
  input: unknown,
): Promise<StaffActionResult> {
  if (!(await getAdminId())) return { ok: false, message: "Unauthorized" };

  const parsed = blockStaffSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { userId } = parsed.data;
  if (!(await findStaffAccount(userId))) {
    return { ok: false, message: "Staff account not found." };
  }

  try {
    const db = await getDb();
    await db
      .collection("user")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { blocked: true } });

    await auth.api.revokeUserSessions({
      headers: await headers(),
      body: { userId },
    });

    return { ok: true, message: "Staff member blocked and signed out." };
  } catch (err) {
    return {
      ok: false,
      message: apiErrorMessage(err, "Failed to block staff account."),
    };
  }
}

export async function unblockStaffAccount(
  input: unknown,
): Promise<StaffActionResult> {
  if (!(await getAdminId())) return { ok: false, message: "Unauthorized" };

  const parsed = blockStaffSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { userId } = parsed.data;

  try {
    const db = await getDb();
    await db
      .collection("user")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { blocked: false } });

    return { ok: true, message: "Staff member unblocked." };
  } catch (err) {
    return {
      ok: false,
      message: apiErrorMessage(err, "Failed to unblock staff account."),
    };
  }
}
