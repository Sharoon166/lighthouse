"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** If set, the user must type this exact string to enable the confirm button. */
  matchText?: string;
  /** Label shown above the required-text input. */
  matchLabel?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm(): ConfirmContextValue {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a <ConfirmProvider>");
  }
  return context;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [matchValue, setMatchValue] = useState("");
  const resolverRef = useRef<(value: boolean) => void>(() => {});
  const inputRef = useRef<HTMLInputElement>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    setMatchValue("");
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolverRef.current(result);
    resolverRef.current = () => {};
    setOptions(null);
    setMatchValue("");
  }, []);

  useEffect(() => {
    if (!options) return;

    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [options, close]);

  const matches =
    !options?.matchText || matchValue.trim() === options.matchText;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
            onClick={() => close(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="flex items-start gap-3">
              {options.danger && (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <HugeiconsIcon icon={Alert02Icon} size={18} />
                </span>
              )}
              <div className="min-w-0">
                <h2
                  id="confirm-dialog-title"
                  className="font-heading text-lg font-semibold tracking-tight text-foreground"
                >
                  {options.title}
                </h2>
                {options.description && (
                  <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {options.description}
                  </div>
                )}
              </div>
            </div>

            {options.matchText && (
              <div className="mt-5 space-y-2">
                <label
                  htmlFor="confirm-match"
                  className="text-sm font-medium text-foreground"
                >
                  {options.matchLabel ??
                    `Type “${options.matchText}” to confirm`}
                </label>
                <Input
                  id="confirm-match"
                  ref={inputRef}
                  value={matchValue}
                  onChange={(event) => setMatchValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && matches) close(true);
                  }}
                  placeholder={options.matchText}
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => close(false)}
              >
                {options.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                type="button"
                variant={options.danger ? "destructive" : "default"}
                disabled={!matches}
                onClick={() => close(true)}
              >
                {options.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
