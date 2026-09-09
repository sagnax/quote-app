"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { type DashboardPeriod, PERIOD_LABEL } from "@/lib/dashboard";

export function DashboardFilters({ period }: { period: DashboardPeriod }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="no-print">
      <Select
        value={period}
        disabled={pending}
        onValueChange={(v) =>
          startTransition(() => {
            router.push(`/dashboard?periodo=${v}`);
          })
        }
      >
        <SelectTrigger className="w-full sm:w-44" aria-label="Período">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PERIOD_LABEL) as DashboardPeriod[]).map((p) => (
            <SelectItem key={p} value={p}>
              {PERIOD_LABEL[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
