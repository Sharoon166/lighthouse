"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  DashboardSquare03Icon,
  Folder02Icon,
  NewsIcon,
  PackageIcon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
  TagsIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "product" | "project" | "blog";
  title: string;
  slug: string;
  status: string;
  href: string;
}

const CommandPaletteContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPaletteDialog />
    </CommandPaletteContext.Provider>
  );
}

function CommandPaletteDialog() {
  const { open, setOpen } = useContext(CommandPaletteContext);
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const search = useCallback(async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function run(action: () => void) {
    setOpen(false);
    setResults([]);
    action();
  }

  const typeLabel: Record<SearchResult["type"], string> = {
    product: "Product",
    project: "Project",
    blog: "Blog post",
  };

  const typeIcon: Record<SearchResult["type"], typeof PackageIcon> = {
    product: PackageIcon,
    project: Folder02Icon,
    blog: NewsIcon,
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setResults([]);
          setQuery("");
        }
      }}
      label="Global search"
      shouldFilter={false}
      className={cn(
        "fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-border bg-card shadow-2xl",
        "overflow-hidden",
      )}
      loop
    >
      <div className="flex items-center border-b border-border px-4">
        <HugeiconsIcon icon={Search01Icon} size={18} className="shrink-0 text-muted-foreground" />
        <Command.Input
          placeholder="Search products, projects, blog posts..."
          className="h-12 w-full bg-transparent pl-3 text-sm outline-none placeholder:text-muted-foreground"
          onValueChange={search}
        />
        <kbd className="pointer-events-none ml-2 hidden select-none rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          ESC
        </kbd>
      </div>

      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
          {loading ? "Searching..." : "No results found."}
        </Command.Empty>

        {/* Live search results */}
        {query && results.length > 0 && (
          <Command.Group heading="Results" className="text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            {results.map((r) => (
              <Command.Item
                key={`${r.type}-${r.slug}`}
                onSelect={() => run(() => router.push(r.href))}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground outline-none data-[selected=true]:bg-accent data-[selected=true]:text-white"
              >
                <HugeiconsIcon icon={typeIcon[r.type]} size={16} />
                <span className="flex-1 truncate">{r.title}</span>
                <span className="text-xs">{typeLabel[r.type]}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {/* Static pages — only show when input is empty */}
        {!query && (
          <>
            <Command.Group heading="Pages" className="text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <CommandItem icon={DashboardSquare03Icon} onSelect={() => run(() => router.push("/admin"))}>
                Dashboard
              </CommandItem>
              <CommandItem icon={PackageIcon} onSelect={() => run(() => router.push("/admin/products"))}>
                Products
              </CommandItem>
              <CommandItem icon={Folder02Icon} onSelect={() => run(() => router.push("/admin/projects"))}>
                Projects
              </CommandItem>
              <CommandItem icon={NewsIcon} onSelect={() => run(() => router.push("/admin/blog"))}>
                Blog
              </CommandItem>
              <CommandItem icon={TagsIcon} onSelect={() => run(() => router.push("/admin/categories"))}>
                Categories
              </CommandItem>
              <CommandItem icon={Settings01Icon} onSelect={() => run(() => router.push("/admin/settings"))}>
                Settings
              </CommandItem>
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-border" />

            <Command.Group heading="Quick actions" className="text-xs font-medium text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              <CommandItem icon={PlusSignIcon} onSelect={() => run(() => router.push("/admin/products/new"))}>
                New product
              </CommandItem>
              <CommandItem icon={PlusSignIcon} onSelect={() => run(() => router.push("/admin/projects/new"))}>
                New project
              </CommandItem>
              <CommandItem icon={PlusSignIcon} onSelect={() => run(() => router.push("/admin/blog/new"))}>
                New blog post
              </CommandItem>
            </Command.Group>
          </>
        )}
      </Command.List>

      <div className="border-t border-border px-4 py-2">
        <p className="text-[11px] text-muted-foreground">
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium">↑↓</kbd> to navigate{" "}
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium">↵</kbd> to select{" "}
          <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium">esc</kbd> to close
        </p>
      </div>
    </Command.Dialog>
  );
}

function CommandItem({
  icon,
  children,
  onSelect,
}: {
  icon: typeof PackageIcon;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-foreground outline-none data-[selected=true]:bg-accent data-[selected=true]:text-white"
    >
      <HugeiconsIcon icon={icon} size={16} />
      {children}
    </Command.Item>
  );
}

export function CommandPaletteTrigger({ className }: { className?: string }) {
  const { setOpen } = useContext(CommandPaletteContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-full border border-border bg-card pl-3 pr-4 text-sm text-muted-foreground transition-colors hover:bg-muted md:w-80",
        className,
      )}
    >
      <HugeiconsIcon icon={Search01Icon} size={16} />
      <span className="flex-1 text-left">Search content...</span>
      <kbd className="hidden select-none rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
        ⌘K
      </kbd>
    </button>
  );
}
