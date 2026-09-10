"use client";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  BanIcon,
  Delete02Icon,
  Edit02Icon,
  Key01Icon,
  LogoutIcon,
  PlusSignIcon,
  SquareUnlock01Icon,
  UserShield01Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { useConfirm } from "@/components/shared/confirm-provider";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
  type StaffAccount,
  blockStaffAccount,
  createStaffAccount,
  deleteStaffAccount,
  listStaffAccounts,
  revokeAllStaffSessions,
  revokeStaffSessions,
  setStaffPassword,
  unblockStaffAccount,
  updateStaffDetails,
} from "@/features/users/actions/staff-actions";

type Notice = { type: "ok" | "err"; text: string } | null;

function EyeIcons({ show }: { show: boolean }) {
  return show ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );
}

function SectionLabel({ id, label }: { id: string; label: string }) {
  return (
    <Label htmlFor={id} className="sm:text-right">
      {label}
    </Label>
  );
}

function CreateStaffDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await createStaffAccount({ name, email, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onOpenChange(false);
    await onCreated();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add staff member"
      description="Create a staff account with access to the dashboard."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
          <SectionLabel id="staff-name" label="Name" />
          <Input
            id="staff-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff name"
            required
            disabled={loading}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
          <SectionLabel id="staff-email" label="Email" />
          <Input
            id="staff-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@lighthouse.com"
            required
            disabled={loading}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
          <SectionLabel id="staff-password" label="Password" />
          <InputGroup>
            <InputGroupInput
              id="staff-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              disabled={loading}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="button" size="icon-xs" onClick={() => setShowPassword((s) => !s)} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                <EyeIcons show={showPassword} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
          <SectionLabel id="staff-confirm-password" label="Confirm password" />
          <InputGroup>
            <InputGroupInput
              id="staff-confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              disabled={loading}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="button" size="icon-xs" onClick={() => setShowConfirm((s) => !s)} tabIndex={-1} aria-label={showConfirm ? "Hide password" : "Show password"}>
                <EyeIcons show={showConfirm} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Adding..." : "Add staff member"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function EditStaffDialog({
  account,
  open,
  onOpenChange,
  onUpdated,
}: {
  account: StaffAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => Promise<void>;
}) {
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(account.name);
      setEmail(account.email);
      setError(null);
    }
  }, [open, account]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updateStaffDetails({ userId: account.id, name, email });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onOpenChange(false);
    await onUpdated();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit ${account.name}`}
      description="Changing the email signs the staff member out on all devices."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
          <SectionLabel id="edit-name" label="Name" />
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
          <SectionLabel id="edit-email" label="Email" />
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function PasswordDialog({
  account,
  open,
  onOpenChange,
  onUpdated,
}: {
  account: StaffAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await setStaffPassword({ userId: account.id, password });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onOpenChange(false);
    await onUpdated();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Change password"
      description={`Set a new password for ${account.name}. They will be signed out on all devices.`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
          <SectionLabel id="pw-new" label="New password" />
          <InputGroup>
            <InputGroupInput
              id="pw-new"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              disabled={loading}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="button" size="icon-xs" onClick={() => setShowPassword((s) => !s)} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                <EyeIcons show={showPassword} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="grid gap-2 sm:grid-cols-[130px_1fr] sm:items-center">
          <SectionLabel id="pw-confirm" label="Confirm password" />
          <InputGroup>
            <InputGroupInput
              id="pw-confirm"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              disabled={loading}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="button" size="icon-xs" onClick={() => setShowConfirm((s) => !s)} tabIndex={-1} aria-label={showConfirm ? "Hide password" : "Show password"}>
                <EyeIcons show={showConfirm} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Saving..." : "Change password"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

const columnHelper = createColumnHelper<StaffAccount>();

function StaffTable({
  staff,
  revealed,
  onToggleReveal,
  onEdit,
  onChangePassword,
  onLogout,
  onBlock,
  onDelete,
}: {
  staff: StaffAccount[];
  revealed: Record<string, boolean>;
  onToggleReveal: (id: string) => void;
  onEdit: (account: StaffAccount) => void;
  onChangePassword: (account: StaffAccount) => void;
  onLogout: (account: StaffAccount) => void;
  onBlock: (account: StaffAccount) => void;
  onDelete: (account: StaffAccount) => void;
}) {
  const columns = [
    columnHelper.accessor("name", {
      header: "Staff",
      cell: (info) => {
        const account = info.row.original;
        const initials = account.name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "ST";

return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                account.isBlocked ? "bg-muted text-muted-foreground" : "bg-[#2a1b45]",
              )}>
                {initials}
              </div>
              {account.isOnline && !account.isBlocked && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-chart-2" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "truncate font-medium",
                  account.isBlocked ? "text-muted-foreground line-through" : "text-foreground",
                )}>
                  {account.name}
                </p>
                {account.isBlocked && (
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                    Blocked
                  </span>
                )}
                {account.isOnline && !account.isBlocked && (
                  <span className="shrink-0 text-[11px] font-medium text-chart-2">
                    Online
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {account.email}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("plainPassword", {
      header: "Password",
      cell: (info) => {
        const account = info.row.original;
        const isRevealed = revealed[account.id];

        return (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-mono text-sm",
                isRevealed ? "text-foreground" : "text-muted-foreground",
                !account.plainPassword && "italic",
              )}
            >
              {isRevealed
                ? account.plainPassword || "Not stored"
                : account.plainPassword
                  ? "••••••••"
                  : "Not stored"}
            </span>
            <button
              type="button"
              onClick={() => onToggleReveal(account.id)}
              disabled={!account.plainPassword}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
              aria-label={isRevealed ? "Hide password" : "Show password"}
            >
              <HugeiconsIcon icon={isRevealed ? ViewIcon : ViewOffIcon} size={14} />
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created",
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const account = info.row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label={`Edit ${account.name}`}
              title="Edit"
              onClick={() => onEdit(account)}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Edit02Icon} size={16} />
            </button>
            <button
              type="button"
              aria-label={`Change password for ${account.name}`}
              title="Change password"
              onClick={() => onChangePassword(account)}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={Key01Icon} size={16} />
            </button>
            <button
              type="button"
              aria-label={`Log out ${account.name}`}
              title="Log out"
              onClick={() => onLogout(account)}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <HugeiconsIcon icon={LogoutIcon} size={16} />
            </button>
            <button
              type="button"
              aria-label={account.isBlocked ? `Unblock ${account.name}` : `Block ${account.name}`}
              title={account.isBlocked ? "Unblock" : "Block"}
              onClick={() => onBlock(account)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-colors",
                account.isBlocked
                  ? "text-chart-2 hover:bg-chart-2/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <HugeiconsIcon icon={account.isBlocked ? SquareUnlock01Icon : BanIcon} size={16} />
            </button>
            <button
              type="button"
              aria-label={`Remove ${account.name}`}
              title="Remove"
              onClick={() => onDelete(account)}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} size={16} />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: staff,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-3xl text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-0 hover:bg-muted/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-middle">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SKELETON_KEYS = ["one", "two", "three", "four", "five"];

function SkeletonTable() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {SKELETON_KEYS.map((key) => (
        <div
          key={key}
          className="h-12 animate-pulse rounded-lg border border-border bg-card"
        />
      ))}
    </div>
  );
}

export function StaffManager({ initialData }: { initialData?: StaffAccount[] }) {
  const [staff, setStaff] = useState<StaffAccount[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<StaffAccount | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<StaffAccount | null>(null);
  const [busyAction, setBusyAction] = useState(false);
  const { confirm } = useConfirm();
  const skipInitialFetch = useRef(Boolean(initialData));

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setStaff(await listStaffAccounts());
    } catch {
      setError("Could not load staff accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void refresh();
  }, []);

  function showResult(result: { ok: boolean; message?: string }, fallback: string) {
    setNotice(
      result.ok
        ? { type: "ok", text: result.message || fallback }
        : { type: "err", text: result.message || "Something went wrong." },
    );
  }

  async function handleCreate() {
    setNotice(null);
    await refresh();
  }

  async function handleLogout(account: StaffAccount) {
    const ok = await confirm({
      title: `Log out ${account.name}?`,
      description: "This signs them out on every device. They can log back in with their password.",
      confirmLabel: "Log out",
      danger: true,
    });
    if (!ok) return;
    setBusyAction(true);
    const result = await revokeStaffSessions({ userId: account.id });
    setBusyAction(false);
    showResult(result, "Logged out.");
    await refresh();
  }

  async function handleLogoutAll() {
    const ok = await confirm({
      title: "Log out all staff?",
      description: "Every staff member will be signed out on all devices.",
      confirmLabel: "Log out all staff",
      danger: true,
    });
    if (!ok) return;
    setBusyAction(true);
    const result = await revokeAllStaffSessions();
    setBusyAction(false);
    showResult(result, "Logged out all staff.");
    await refresh();
  }

  async function handleBlock(account: StaffAccount) {
    if (account.isBlocked) {
      const ok = await confirm({
        title: `Unblock ${account.name}?`,
        description: "They will be able to log in again.",
        confirmLabel: "Unblock",
      });
      if (!ok) return;
      setBusyAction(true);
      const result = await unblockStaffAccount({ userId: account.id });
      setBusyAction(false);
      showResult(result, "Unblocked.");
    } else {
      const ok = await confirm({
        title: `Block ${account.name}?`,
        description: "They will be signed out immediately and cannot log in until unblocked.",
        confirmLabel: "Block",
        danger: true,
      });
      if (!ok) return;
      setBusyAction(true);
      const result = await blockStaffAccount({ userId: account.id });
      setBusyAction(false);
      showResult(result, "Blocked and signed out.");
    }
    await refresh();
  }

  async function handleDelete(account: StaffAccount) {
    const ok = await confirm({
      title: `Remove ${account.name}?`,
      description: `${account.name} will lose dashboard access immediately. This cannot be undone.`,
      confirmLabel: "Remove staff",
      danger: true,
    });
    if (!ok) return;
    setBusyAction(true);
    const result = await deleteStaffAccount({ userId: account.id });
    setBusyAction(false);
    showResult(result, "Removed.");
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
            Staff
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff members can manage the dashboard. A maximum of one staff account is allowed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void handleLogoutAll()} disabled={busyAction || staff.length === 0}>
            <HugeiconsIcon icon={LogoutIcon} size={15} className="mr-1.5" />
            Log out all staff
          </Button>
          {staff.length === 0 && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <HugeiconsIcon icon={PlusSignIcon} size={15} className="mr-1.5" />
              Add staff
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {notice && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            notice.type === "ok"
              ? "border-chart-2/40 bg-chart-2/10 text-chart-2"
              : "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          {notice.text}
        </div>
      )}

      {loading && staff.length === 0 ? (
        <SkeletonTable />
      ) : staff.length === 0 ? (
        <Empty className="rounded-2xl border border-border bg-card">
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={UserShield01Icon} size={24} />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No staff accounts yet</EmptyTitle>
            <EmptyDescription>
              Add a staff member to give them dashboard access, then use this page to manage their
              email, password and sessions.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <HugeiconsIcon icon={PlusSignIcon} size={15} className="mr-1.5" />
              Add staff member
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className={cn(loading && "pointer-events-none opacity-60")}>
          <StaffTable
            staff={staff}
            revealed={revealed}
            onToggleReveal={(id) =>
              setRevealed((prev) => ({ ...prev, [id]: !prev[id] }))
            }
            onEdit={setEditing}
            onChangePassword={setPasswordTarget}
            onLogout={(account) => void handleLogout(account)}
            onBlock={(account) => void handleBlock(account)}
            onDelete={(account) => void handleDelete(account)}
          />
        </div>
      )}

      <CreateStaffDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreate}
      />

      {editing && (
        <EditStaffDialog account={editing} open onOpenChange={(open) => !open && setEditing(null)} onUpdated={refresh} />
      )}

      {passwordTarget && (
        <PasswordDialog account={passwordTarget} open onOpenChange={(open) => !open && setPasswordTarget(null)} onUpdated={refresh} />
      )}
    </div>
  );
}