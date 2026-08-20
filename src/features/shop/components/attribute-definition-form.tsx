"use client";

import { Delete02Icon, PlusSignIcon, SaveIcon, CheckIcon, ArrowLeft02Icon, Warning } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FIELD_LIMITS } from "@/lib/field-limits";
import { ColorSwatch, PRESET_COLORS } from "@/components/shared/color-picker";
import {
  type AttributeDefinition,
  type AttributeDefinitionActionResult,
  createAttributeDefinition,
  updateAttributeDefinition,
} from "../actions/attribute-definition-actions";
import {
  type AttributeDefinitionInput,
  attributeDefinitionInputSchema,
} from "../validation/attribute-definition";

interface AttributeDefinitionFormProps {
  mode?: "create" | "edit";
  id?: string;
  initialData?: AttributeDefinition | null;
  /** When true, renders a compact form without the full page header. */
  compact?: boolean;
  onSave?: () => void;
}

function scrollToFirstError(fieldErrors: {
  [key: string]: string[] | undefined;
}) {
  const first = Object.keys(fieldErrors).find(
    (field) => fieldErrors[field]?.length,
  );
  if (!first) return;
  const node = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
  if (!node) return;
  node.scrollIntoView({ behavior: "smooth", block: "center" });
  node
    .querySelector<HTMLElement>("input, textarea, select")
    ?.focus({ preventScroll: true });
}

type AttrType = "text" | "number" | "select" | "boolean" | "color";

const TYPE_LABELS: Record<AttrType, string> = {
  text: "Text",
  number: "Number",
  select: "Select (Dropdown)",
  boolean: "Yes / No",
  color: "Color",
};

export function AttributeDefinitionForm({
  mode = "create",
  id,
  initialData = null,
  compact = false,
  onSave,
}: AttributeDefinitionFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();

  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<AttrType>(
    (initialData?.type as AttrType) ?? "select",
  );
  const [options, setOptions] = useState<string[]>(initialData?.options ?? []);
  const [newOption, setNewOption] = useState("");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);

  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string[] | undefined;
  }>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const savedNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (type !== "select" && type !== "color") {
      setOptions([]);
      setNewOption("");
    }
  }, [type]);

  const clearFieldError = (field: string) => {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const fieldError = (field: string) => fieldErrors[field]?.[0];

  const addOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed) return;
    if (options.includes(trimmed)) {
      setFieldErrors((prev) => ({
        ...prev,
        options: ["This option already exists."],
      }));
      return;
    }
    if (options.length >= FIELD_LIMITS.attributeDefinition.maxOptions) {
      setFieldErrors((prev) => ({
        ...prev,
        options: [
          `Maximum ${FIELD_LIMITS.attributeDefinition.maxOptions} options allowed.`,
        ],
      }));
      return;
    }
    setOptions((prev) => [...prev, trimmed]);
    setNewOption("");
    clearFieldError("options");
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const addColorOption = () => {
    const hex = `#${newOption.trim().toUpperCase()}`;
    if (!/^#([0-9A-F]{6})$/.test(hex)) return;
    if (options.some((o) => o.toUpperCase() === hex)) {
      setFieldErrors((prev) => ({
        ...prev,
        options: ["This color already exists."],
      }));
      return;
    }
    if (options.length >= FIELD_LIMITS.attributeDefinition.maxOptions) {
      setFieldErrors((prev) => ({
        ...prev,
        options: [
          `Maximum ${FIELD_LIMITS.attributeDefinition.maxOptions} options allowed.`,
        ],
      }));
      return;
    }
    setOptions((prev) => [...prev, hex]);
    setNewOption("");
    clearFieldError("options");
  };

  const buildPayload = (): AttributeDefinitionInput => ({
    name,
    type,
    options: type === "select" || type === "color" ? options : [],
    isActive,
    sortOrder,
  });

  const run = () => {
    const result = attributeDefinitionInputSchema.safeParse(buildPayload());
    if (!result.success) {
      const flattened = result.error.flatten();
      setFieldErrors(
        flattened.fieldErrors as { [key: string]: string[] | undefined },
      );
      setFormErrors(flattened.formErrors);
      scrollToFirstError(
        flattened.fieldErrors as { [key: string]: string[] | undefined },
      );
      return;
    }

    startTransition(async () => {
      const payload = JSON.parse(JSON.stringify(buildPayload())) as unknown;
      const response: AttributeDefinitionActionResult = isEdit
        ? await updateAttributeDefinition(id!, payload)
        : await createAttributeDefinition(payload);

      if (!response.ok) {
        setFieldErrors(response.fieldErrors);
        setFormErrors(response.formErrors);
        scrollToFirstError(response.fieldErrors);
        return;
      }

      setFieldErrors({});
      setFormErrors([]);

      setSavedNotice("Attribute saved.");
      if (savedNoticeTimer.current) clearTimeout(savedNoticeTimer.current);
      savedNoticeTimer.current = setTimeout(() => setSavedNotice(null), 3000);

      if (onSave) {
        onSave();
      } else if (!isEdit) {
        router.replace("/admin/attributes");
      } else {
        router.refresh();
      }
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addOption();
    }
  };

  const hasFieldErrors = Object.values(fieldErrors).some(
    (errors) => errors && errors.length > 0,
  );
  const showErrorBanner = formErrors.length > 0 || hasFieldErrors;

  return (
    <div className={compact ? "space-y-6" : "flex min-h-dvh flex-col"}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center gap-4 px-6 py-4">
          <Link
            href="/admin/attributes"
            aria-label="Back to attributes"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl tracking-tight text-foreground md:text-3xl">
                {isEdit ? "Edit attribute" : "New attribute"}
              </h1>
              {isEdit && initialData && (
                <StatusBadge
                  status={initialData.isActive ? "active" : "archived"}
                />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? `/${initialData?.key ?? ""}`
                : "Define a product attribute that categories can use."}
            </p>
          </div>
        </div>
      )}
      {/* Error banner */}
      {showErrorBanner && (
        <div
          role="alert"
          className="mx-6 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <HugeiconsIcon icon={Warning} size={16} className="mt-0.5" />
          <div>
            {formErrors.length > 0 ? (
              formErrors.map((message) => <p key={message}>{message}</p>)
            ) : (
              <p>
                Could not save your attribute. Please check the highlighted
                fields.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Form body */}
      <div className="flex-1 px-6 pb-24">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Name */}
          <div className="space-y-2" data-field="name">
            <Label htmlFor="name">Name</Label>
            <InputGroup>
              <InputGroupInput
                id="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError("name");
                }}
                placeholder="e.g. Material, Color, Voltage"
                aria-invalid={Boolean(fieldError("name"))}
                maxLength={FIELD_LIMITS.attributeDefinition.name}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>
                  {name.length}/{FIELD_LIMITS.attributeDefinition.name}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {fieldError("name") && (
              <p className="text-xs text-destructive">{fieldError("name")}</p>
            )}
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Key: <span className="font-mono">{initialData?.key}</span>{" "}
                (immutable)
              </p>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Type */}
          <div className="space-y-3" data-field="type">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as AttrType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    type === t
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            {fieldError("type") && (
              <p className="text-xs text-destructive">{fieldError("type")}</p>
            )}
            {type === "text" && (
              <p className="text-xs text-muted-foreground">
                Products will have a free-text input for this attribute.
              </p>
            )}
            {type === "number" && (
              <p className="text-xs text-muted-foreground">
                Products will have a numeric input for this attribute.
              </p>
            )}
            {type === "boolean" && (
              <p className="text-xs text-muted-foreground">
                Products will have a Yes / No toggle for this attribute.
              </p>
            )}
            {type === "color" && (
              <p className="text-xs text-muted-foreground">
                Products will have a color picker for this attribute.
              </p>
            )}
          </div>

          {/* Options (select type) */}
          {type === "select" && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-3" data-field="options">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <InputGroup className="flex-1">
                    <InputGroupInput
                      value={newOption}
                      onChange={(event) => {
                        setNewOption(event.target.value);
                        clearFieldError("options");
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Type an option and press Enter"
                      maxLength={FIELD_LIMITS.attributeDefinition.optionValue}
                    />
                  </InputGroup>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    disabled={!newOption.trim()}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={16} />
                    Add
                  </Button>
                </div>
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {options.map((option, index) => (
                      <span
                        key={`${option}-${index}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1 text-xs"
                      >
                        {option}
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {fieldError("options") && (
                  <p className="text-xs text-destructive">
                    {fieldError("options")}
                  </p>
                )}
                {options.length === 0 && !fieldError("options") && (
                  <p className="text-xs text-muted-foreground">
                    Add at least one option for the dropdown.
                  </p>
                )}
              </div>
            </>
          )}

          {/* Options (color type) */}
          {type === "color" && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-3" data-field="options">
                <Label>Colors</Label>
                <p className="text-xs text-muted-foreground">
                  Click a swatch or type a hex code to add colors.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((color) => {
                    const alreadyAdded = options.some(
                      (o) => o.toUpperCase() === color.hex.toUpperCase(),
                    );
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        title={`${color.name}${alreadyAdded ? " (added)" : ""}`}
                        disabled={alreadyAdded}
                        onClick={() => {
                          if (options.length >= FIELD_LIMITS.attributeDefinition.maxOptions) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              options: [
                                `Maximum ${FIELD_LIMITS.attributeDefinition.maxOptions} options allowed.`,
                              ],
                            }));
                            return;
                          }
                          setOptions((prev) => [...prev, color.hex]);
                          clearFieldError("options");
                        }}
                        className={`size-7 shrink-0 rounded-full border-2 transition-all ${
                          alreadyAdded
                            ? "cursor-not-allowed border-foreground/30 opacity-40"
                            : "border-border hover:scale-110 hover:border-foreground/30"
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">#</span>
                    <Input
                      value={newOption}
                      onChange={(event) => {
                        const val = event.target.value
                          .replace(/[^0-9A-Fa-f]/g, "")
                          .slice(0, 6);
                        setNewOption(val);
                        clearFieldError("options");
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="FF0000"
                      className="h-8 w-24 font-mono text-xs"
                      maxLength={6}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColorOption}
                    disabled={!newOption.trim()}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={14} />
                    Add
                  </Button>
                </div>
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {options.map((option, index) => (
                      <span
                        key={`${option}-${index}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted pl-1 pr-2.5 py-0.5 text-xs"
                      >
                        <ColorSwatch color={option} size="xs" />
                        {option.toUpperCase()}
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {fieldError("options") && (
                  <p className="text-xs text-destructive">
                    {fieldError("options")}
                  </p>
                )}
                {options.length === 0 && !fieldError("options") && (
                  <p className="text-xs text-muted-foreground">
                    Add at least one color for this attribute.
                  </p>
                )}
              </div>
            </>
          )}

          <div className="h-px bg-border" />

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <div className="flex-1">
              <Label htmlFor="is-active" className="cursor-pointer font-medium">
                Active
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Inactive attributes are hidden from category assignment.
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Sort order */}
          <div className="space-y-2" data-field="sortOrder">
            <Label htmlFor="sort-order">Sort order</Label>
            <input
              id="sort-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in lists.
            </p>
          </div>
        </div>
      </div>

      {/* Compact header */}
      {compact && (
        <div className="flex items-center justify-end gap-3">
          {savedNotice && (
            <span className="flex items-center gap-1.5 rounded-full border border-chart-2/40 bg-chart-2/10 px-3 py-1 text-xs font-medium text-chart-2">
              <HugeiconsIcon icon={CheckIcon} size={14} />
              {savedNotice}
            </span>
          )}
          <Button type="button" disabled={isPending} onClick={run}>
            <HugeiconsIcon icon={SaveIcon} size={16} />
            {isPending ? "Saving\u2026" : "Save"}
          </Button>
        </div>
      )}
      
      {/* Sticky bottom bar */}
      {!compact && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 px-6 py-4">
            {savedNotice && (
              <span className="flex items-center gap-1.5 rounded-full border border-chart-2/40 bg-chart-2/10 px-3 py-1 text-xs font-medium text-chart-2">
                <HugeiconsIcon icon={CheckIcon} size={14} />
                {savedNotice}
              </span>
            )}
            <Button type="button" disabled={isPending} onClick={run}>
              <HugeiconsIcon icon={SaveIcon} size={16} />
              {isPending ? "Saving\u2026" : "Save"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
