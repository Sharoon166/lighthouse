import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS = {
  published: "success" as const,
  draft: "muted" as const,
  scheduled: "accent" as const,
  archived: "outline" as const,
  ongoing: "default" as const,
  completed: "success" as const,
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={
        STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] ?? "outline"
      }
      className="capitalize"
    >
      {status}
    </Badge>
  );
}
