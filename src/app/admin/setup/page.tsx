import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { SetupForm } from "./setup-form";

export default async function AdminSetupPage() {
  await connectToDatabase();

  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db();

  const adminExists = await db.collection("user").findOne({ role: "admin" });
  await client.close();

  if (adminExists) {
    notFound();
  }

  return <SetupForm />;
}
