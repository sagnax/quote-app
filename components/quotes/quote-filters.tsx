"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUOTE_STATUSES, STATUS_META } from "@/lib/quotes";

export function QuoteFilters({
  initialQuery,
  initialStatus,
}: {
  initialQuery: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  function push(nextQuery: string, nextStatus: string) {
    startTransition(() => {
      const params = new URLSearchParams();
      if (nextQuery.trim()) params.set("q", nextQuery.trim());
      if (nextStatus && nextStatus !== "todas")
        params.set("status", nextStatus);
      router.push(`/orcamentos${params.size ? `?${params}` : ""}`);
    });
  }

  return (
    <div className="no-print flex flex-col gap-2 sm:flex-row">
      <form
        className="relative w-full sm:max-w-xs"
        onSubmit={(e) => {
          e.preventDefault();
          push(query, initialStatus);
        }}
      >
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por número, título, cliente…"
          aria-label="Buscar orçamentos"
          className="pl-9"
          disabled={pending}
        />
      </form>
      <Select
        value={initialStatus || "todas"}
        onValueChange={(v) => push(query, v)}
        disabled={pending}
      >
        <SelectTrigger
          className="w-full sm:w-44"
          aria-label="Filtrar por status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todos os status</SelectItem>
          {QUOTE_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
