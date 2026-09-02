"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  placeholder?: string;
  description?: string;
}

function parseDatetimeLocal(value: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toDatetimeLocalString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

export function DateTimePicker({
  value,
  onChange,
  label,
  id,
  placeholder = "Pick a date & time",
  description,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDatetimeLocal(value);

  const timeRef = useRef<HTMLInputElement>(null);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const current = parseDatetimeLocal(value);
    const updated = new Date(date);
    if (current) {
      updated.setHours(current.getHours(), current.getMinutes());
    } else {
      updated.setHours(9, 0, 0, 0);
    }
    onChange(toDatetimeLocalString(updated));
  };

  const handleTimeChange = (timeStr: string) => {
    if (!selectedDate) return;
    const [h, m] = timeStr.split(":").map(Number);
    const updated = new Date(selectedDate);
    updated.setHours(h ?? 0, m ?? 0, 0, 0);
    onChange(toDatetimeLocalString(updated));
  };

  const currentTime = selectedDate
    ? `${String(selectedDate.getHours()).padStart(2, "0")}:${String(selectedDate.getMinutes()).padStart(2, "0")}`
    : "09:00";

  useEffect(() => {
    if (open && timeRef.current && selectedDate) {
      timeRef.current.value = currentTime;
    }
  }, [open, currentTime, selectedDate]);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            !selectedDate && "text-muted-foreground",
          )}
        >
          <HugeiconsIcon icon={Calendar03Icon} size={16} />
          {selectedDate ? format(selectedDate, "PPP 'at' HH:mm") : placeholder}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            captionLayout="dropdown"
          />
          <div className="border-t border-border p-3">
            <Label className="text-xs text-muted-foreground">Time</Label>
            <Input
              ref={timeRef}
              type="time"
              defaultValue={currentTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="mt-1.5 h-9 text-sm"
            />
          </div>
        </PopoverContent>
      </Popover>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
