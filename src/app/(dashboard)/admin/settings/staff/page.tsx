import type { Metadata } from "next";
import { listStaffAccounts } from "@/features/users/actions/staff-actions";
import { requireAdmin } from "@/lib/require-role";
import { StaffManager } from "./staff-manager";

export const metadata: Metadata = {
  title: "Staff · Lighthouse",
};

export default async function StaffSettingsPage() {
  await requireAdmin();
  const staff = await listStaffAccounts();
  return <StaffManager initialData={staff} />;
}
