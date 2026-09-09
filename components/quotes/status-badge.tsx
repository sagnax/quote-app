import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { type QuoteStatus, STATUS_META } from "@/lib/quotes";

export function StatusBadge({
  status,
  className,
}: {
  status: QuoteStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={cn("gap-1.5", className)}>
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", meta.dotClass)}
      />
      {meta.label}
    </Badge>
  );
}
