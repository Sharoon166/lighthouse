"use client";

import { Loading02Icon, PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { getAllActiveAttributeDefinitions } from "../actions/attribute-definition-actions";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface AttributeLibraryItem {
  id: string;
  key: string;
  name: string;
  type: string;
  options: string[];
}

export function AddAttributeDialog({
  open,
  onOpenChange,
  title,
  existingNames,
  onAdd,
  onCreateNew,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  existingNames: Set<string>;
  onAdd: (attr: AttributeLibraryItem) => void;
  onCreateNew: (name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [library, setLibrary] = useState<AttributeLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
      setNewName("");
      return;
    }
    if (library.length > 0) return;
    setIsLoading(true);
    getAllActiveAttributeDefinitions()
      .then(setLibrary)
      .catch(() => setLibrary([]))
      .finally(() => setIsLoading(false));
  }, [open, library.length]);

  const filtered = library.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.key.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search attributes..."
            className="h-9 pl-9 text-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <HugeiconsIcon
              icon={Loading02Icon}
              size={20}
              className="animate-spin text-muted-foreground"
            />
          </div>
        ) : filtered.length > 0 ? (
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {filtered.map((attr) => {
              const alreadyAdded = existingNames.has(attr.name);
              return (
                <button
                  key={attr.id}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => {
                    onAdd(attr);
                    onOpenChange(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    alreadyAdded
                      ? "cursor-not-allowed text-muted-foreground/50"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{attr.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {alreadyAdded ? "Added" : attr.type}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No attributes found.
          </p>
        )}

        <div className="border-t border-border pt-3">
          <Label className="text-xs">Or create a new attribute</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && newName.trim()) {
                  event.preventDefault();
                  onCreateNew(newName.trim());
                  onOpenChange(false);
                }
              }}
              placeholder="e.g. Beam Angle"
              className="h-9 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!newName.trim()}
              onClick={() => {
                if (newName.trim()) {
                  onCreateNew(newName.trim());
                  onOpenChange(false);
                }
              }}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} />
              Create
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
