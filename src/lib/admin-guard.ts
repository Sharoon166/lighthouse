import { getCurrentSession } from "@/lib/require-role";

export async function requireAdminForAction(): Promise<{
  ok: false;
  message: string;
} | null> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, message: "Unauthorized" };
  if ((session.user.role as string) !== "admin") {
    return { ok: false, message: "Only admins can perform this action." };
  }
  return null;
}
