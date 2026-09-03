"use client";

import { Activity, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useConfirm } from "@/components/shared/confirm-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
] as const;

type Tab = (typeof TABS)[number]["id"];

function EyeIcons({ show }: { show: boolean }) {
  return show ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggle,
  disabled,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
      <Label htmlFor={id} className="sm:text-right">
        {label}
      </Label>
      <InputGroup>
        <InputGroupInput
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" onClick={onToggle} tabIndex={-1} aria-label={show ? "Hide" : "Show"}>
            <EyeIcons show={show} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: session, refetch } = authClient.useSession();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<Tab>("account");

  // Profile state
  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const { error } = await authClient.updateUser({ name: name || undefined });
      if (error) {
        setProfileMsg({ type: "err", text: error.message || "Failed to update." });
      } else {
        setProfileMsg({ type: "ok", text: "Saved." });
        refetch();
        setName("");
      }
    } catch {
      setProfileMsg({ type: "err", text: "Something went wrong." });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "err", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "err", text: "Must be at least 8 characters." });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        setPasswordMsg({ type: "err", text: error.message || "Failed." });
      } else {
        setPasswordMsg({ type: "ok", text: "Password changed." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg({ type: "err", text: "Something went wrong." });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleSignOut() {
    const ok = await confirm({
      title: "Sign out?",
      description: "You will be redirected to the login page.",
      confirmLabel: "Sign out",
      danger: true,
    });
    if (!ok) return;
    authClient.signOut({
      fetchOptions: { onSuccess: () => { window.location.href = "/admin/login"; } },
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
              activeTab === tab.id
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-2xl">
        <Activity mode={activeTab === "account" ? "visible" : "hidden"}>
          <div className="space-y-10">
            {/* Profile */}
            <section>
              <h2 className="text-base font-semibold text-foreground">Profile</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Your display name and account info.
              </p>

              <div className="my-4 h-px bg-border" />

              <div className="mb-6 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#2a1b45] text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {user?.name || "Admin"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <span className="ml-auto rounded-full bg-[#2a1b45]/8 px-3 py-1 text-xs font-semibold text-[#2a1b45]">
                  {(user as Record<string, unknown>)?.role as string || "user"}
                </span>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
                  <Label htmlFor="name" className="sm:text-right">
                    Display name
                  </Label>
                  <Input
                    id="name"
                    placeholder={user?.name || "Your name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={profileLoading}
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
                  <Label htmlFor="email" className="text-muted-foreground sm:text-right">
                    Email
                  </Label>
                  <div>
                    <Input id="email" value={user?.email || ""} disabled className="bg-muted/40" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Contact your team lead to change your email.
                    </p>
                  </div>
                </div>

                {profileMsg && (
                  <p className={`text-sm ${profileMsg.type === "ok" ? "text-chart-2" : "text-destructive"}`}>
                    {profileMsg.text}
                  </p>
                )}

                <div className="sm:grid sm:grid-cols-[140px_1fr] sm:items-center">
                  <div />
                  <div className="flex items-center gap-3">
                    <Button
                      type="submit"
                      disabled={profileLoading || !name}
                      size="sm"
                      className="bg-[#2a1b45] text-white hover:bg-[#2a1b45]/90"
                    >
                      {profileLoading ? "Saving..." : "Save changes"}
                    </Button>
                    {profileMsg?.type === "ok" && (
                      <span className="text-xs text-muted-foreground">Changes saved</span>
                    )}
                  </div>
                </div>
              </form>
            </section>

            {/* Sign out */}
            <section>
              <h2 className="text-base font-semibold text-foreground">Sign out</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Sign out of your account on this device.
              </p>

              <div className="my-4 h-px bg-border" />

              <Button variant="destructive" size="sm" onClick={() => void handleSignOut()}>
                Sign out
              </Button>
            </section>
          </div>
        </Activity>

        <Activity mode={activeTab === "security" ? "visible" : "hidden"}>
          <div className="space-y-10">
            <section>
              <h2 className="text-base font-semibold text-foreground">Password</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Keep your account secure with a strong password.
              </p>

              <div className="my-4 h-px bg-border" />

              <form onSubmit={handleChangePassword} className="space-y-4">
                <PasswordField
                  id="current-password"
                  label="Current password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  show={showCurrent}
                  onToggle={() => setShowCurrent((s) => !s)}
                  disabled={passwordLoading}
                  autoComplete="current-password"
                  required
                />
                <PasswordField
                  id="new-password"
                  label="New password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNew}
                  onToggle={() => setShowNew((s) => !s)}
                  disabled={passwordLoading}
                  autoComplete="new-password"
                  required
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  onToggle={() => setShowConfirm((s) => !s)}
                  disabled={passwordLoading}
                  autoComplete="new-password"
                  required
                />

                {passwordMsg && (
                  <p className={`text-sm ${passwordMsg.type === "ok" ? "text-chart-2" : "text-destructive"}`}>
                    {passwordMsg.text}
                  </p>
                )}

                <div className="sm:grid sm:grid-cols-[140px_1fr] sm:items-center">
                  <div />
                  <Button
                    type="submit"
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                    size="sm"
                    variant="outline"
                  >
                    {passwordLoading ? "Changing..." : "Change password"}
                  </Button>
                </div>
              </form>
            </section>
          </div>
        </Activity>
      </div>
    </div>
  );
}
