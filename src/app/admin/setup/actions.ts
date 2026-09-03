"use server";

import { auth } from "@/lib/auth";
import { MongoClient } from "mongodb";

export async function createFirstAdmin({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  // Check if admin already exists
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db();
  const adminExists = await db.collection("user").findOne({ role: "admin" });

  if (adminExists) {
    await client.close();
    return { error: "An admin account already exists." };
  }

  // Create user via Better Auth
  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    // Get the user ID from the result
    const userId = (result as any)?.user?.id || (result as any)?.id;

    if (userId) {
      // Set role to admin
      await db.collection("user").updateOne(
        { _id: userId },
        { $set: { role: "admin" } },
      );
    }

    await client.close();
    return { ok: true };
  } catch (err: any) {
    await client.close();
    return { error: err.message || "Failed to create admin account." };
  }
}
