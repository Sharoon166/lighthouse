"use client";

import { useState } from "react";
import { showrooms } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ShowroomTabs() {
  const [activeId, setActiveId] = useState(showrooms[0].id);
  const [mapKey, setMapKey] = useState(0);
  const active = showrooms.find((s) => s.id === activeId) ?? showrooms[0];

  const handleTabClick = (id: string) => {
    setActiveId(id);
    setMapKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {showrooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => handleTabClick(room.id)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
              activeId === room.id
                ? "border-primary bg-secondary text-secondary-foreground"
                : "border-border text-foreground hover:bg-muted",
            )}
          >
            {room.label}
          </button>
        ))}
      </div>

      <div className="relative min-h-96 aspect-2/1 w-full overflow-hidden rounded-lg border border-border bg-muted">
        <iframe
          key={mapKey}
          src={active.embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Showroom map - ${active.label}`}
        />
      </div>
    </div>
  );
}
