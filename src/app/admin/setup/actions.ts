"use server";

import { MongoClient, ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

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
      // Promote the new account to admin.
      //
      // Important: `user._id` is stored as a BSON ObjectId, so the string id
      // returned by Better Auth MUST be wrapped in `new ObjectId(...)`.
      // Filtering on the raw string matches zero documents and fails
      // silently, which leaves the account stuck at the default "user"
      // role and triggers login redirects.
      //
      // Escape hatch: if this promotion ever breaks, create an admin via
      // Better Auth's CLI from a terminal:
      //   npx auth@latest create-admin --email <email> --name "<name>" --role admin
      if (!ObjectId.isValid(userId)) {
        await client.close();
        return { error: "Could not determine the new account id." };
      }

      const update = await db
        .collection("user")
        .updateOne({ _id: new ObjectId(userId) }, { $set: { role: "admin" } });

      if (update.matchedCount === 0) {
        await client.close();
        return {
          error:
            "Account was created but could not be promoted to admin. " +
            "Set role to \"admin\" for this user in the database, or create " +
            "an admin via CLI: npx auth@latest create-admin --email " +
            email +
            " --role admin",
        };
      }
    }

    await client.close();
    return { ok: true };
  } catch (err: any) {
    await client.close();
    return { error: err.message || "Failed to create admin account." };
  }
}
