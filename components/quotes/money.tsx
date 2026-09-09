import { cn } from "cn";
import { formatBRL } from "@/lib/format";

export function Money({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular text-sm", className)}>
      {formatBRL(value)}
    </span>
  );
}
