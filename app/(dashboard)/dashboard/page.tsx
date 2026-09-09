import {
  CircleCheck,
  Clock,
  FileText,
  type LucideIcon,
  Percent,
  Plus,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { EmptyState } from "@/components/quotes/empty-state";
import { Money } from "@/components/quotes/money";
import { PageHeader } from "@/components/quotes/page-header";
import { StatusBadge } from "@/components/quotes/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type DashboardPeriod, PERIOD_LABEL } from "@/lib/dashboard";
import { formatDateBR } from "@/lib/format";
import { effectiveStatus, type QuoteStatus } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  numero: string;
  titulo: string;
  status: QuoteStatus;
  validade_em: string | null;
  total: number | string;
  created_at: string;
  clients: { nome: string } | { nome: string }[] | null;
};

/** Join pode vir como objeto (muitos-para-um) — normaliza para o nome. */
function clientName(row: Row): string {
  if (!row.clients) return "—";
  if (Array.isArray(row.clients)) return row.clients[0]?.nome ?? "—";
  return row.clients.nome;
}

function periodRange(period: DashboardPeriod): { start: Date; end: Date } {
  const now = new Date();
  if (period === "anterior") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end };
  }
  if (period === "90d") {
    return { start: new Date(now.getTime() - 90 * 24 * 3600 * 1000), end: now };
  }
  return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short" });
}

function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 pt-6">
        <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <span
            className={`flex size-6 items-center justify-center rounded-md ${tone}`}
          >
            <Icon className="size-3.5" aria-hidden />
          </span>
          {label}
        </p>
        <p className="font-mono tabular font-semibold text-2xl">{value}</p>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string | string[] }>;
}) {
  const { periodo } = await searchParams;
  const raw = Array.isArray(periodo) ? periodo[0] : periodo;
  const period: DashboardPeriod =
    raw === "anterior" || raw === "90d" ? raw : "mes";
  const periodLabel = PERIOD_LABEL[period] ?? PERIOD_LABEL.mes;
  const { start, end } = periodRange(period);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, numero, titulo, status, validade_em, total, created_at, clients(nome)",
    )
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];

  if (!error && rows.length === 0) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Visão do seu funil de orçamentos."
        />
        <EmptyState
          icon={FileText}
          title="Sem dados ainda"
          description="Crie o primeiro orçamento para ver KPIs, vencimentos e histórico aqui."
          action={
            <Button size="sm" asChild>
              <Link href="/orcamentos/novo">
                <Plus aria-hidden />
                Criar orçamento
              </Link>
            </Button>
          }
        />
      </>
    );
  }

  const inRange = (iso: string) => {
    const d = new Date(iso);
    return d >= start && d <= end;
  };

  const pending = rows.filter(
    (r) => effectiveStatus(r.status, r.validade_em) === "pendente",
  );
  const pendingTotal = pending.reduce((n, r) => n + Number(r.total), 0);

  const approvedInRange = rows.filter(
    (r) => r.status === "aprovado" && inRange(r.created_at),
  );
  const approvedTotal = approvedInRange.reduce(
    (n, r) => n + Number(r.total),
    0,
  );

  const decidedInRange = rows.filter(
    (r) =>
      (r.status === "aprovado" || r.status === "recusado") &&
      inRange(r.created_at),
  );
  const conversion =
    decidedInRange.length === 0
      ? 0
      : (approvedInRange.length / decidedInRange.length) * 100;

  const ticket =
    approvedInRange.length === 0 ? 0 : approvedTotal / approvedInRange.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today.getTime() + 15 * 24 * 3600 * 1000);
  const expiring = rows
    .filter((r) => {
      const eff = effectiveStatus(r.status, r.validade_em);
      if (eff !== "pendente" && eff !== "rascunho") return false;
      if (!r.validade_em) return false;
      const v = new Date(`${r.validade_em}T00:00:00`);
      return v >= today && v <= soon;
    })
    .sort((a, b) => (a.validade_em ?? "").localeCompare(b.validade_em ?? ""))
    .slice(0, 5);

  const latest = rows.slice(0, 5);

  const months: string[] = [];
  const cursor = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  for (let i = 0; i < 6; i++) {
    months.push(
      monthKey(new Date(cursor.getFullYear(), cursor.getMonth() + i, 1)),
    );
  }
  const byMonth = new Map(months.map((m) => [m, 0]));
  for (const r of rows) {
    if (r.status !== "aprovado") continue;
    const key = monthKey(new Date(r.created_at));
    if (byMonth.has(key))
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(r.total));
  }
  const maxMonth = Math.max(1, ...byMonth.values());

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Visão do funil · ${periodLabel.toLowerCase()}.`}
        actions={<DashboardFilters period={period} />}
      />
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          Não foi possível carregar os dados: {error.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Pendente agora"
          icon={Clock}
          tone="bg-warning/15 text-warning"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            notation: "compact",
          }).format(pendingTotal)}
          hint={`${pending.length} aguardando resposta`}
        />
        <Kpi
          label="Aprovado no período"
          icon={CircleCheck}
          tone="bg-success/15 text-success"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            notation: "compact",
          }).format(approvedTotal)}
          hint={`${approvedInRange.length} aprovados`}
        />
        <Kpi
          label="Conversão"
          icon={Percent}
          tone="bg-info/15 text-info"
          value={`${Math.round(conversion)}%`}
          hint={`${decidedInRange.length} decididos no período`}
        />
        <Kpi
          label="Ticket médio"
          icon={Receipt}
          tone="bg-primary/10 text-primary"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            notation: "compact",
          }).format(ticket)}
          hint="por orçamento aprovado"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aprovados · últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {months.map((m) => {
              const value = byMonth.get(m) ?? 0;
              return (
                <div key={m} className="flex items-center gap-3 text-sm">
                  <span className="w-10 text-muted-foreground capitalize">
                    {monthLabel(m)}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{
                        width: `${Math.round((value / maxMonth) * 100)}%`,
                      }}
                    />
                  </div>
                  <Money value={value} className="w-24 text-right text-xs" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vencendo em 15 dias</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {expiring.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nada vencendo por aqui.
              </p>
            ) : (
              expiring.map((r) => (
                <Link
                  key={r.id}
                  href={`/orcamentos/${r.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {r.titulo}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {r.numero} · até{" "}
                      {r.validade_em
                        ? formatDateBR(`${r.validade_em}T00:00:00`)
                        : "—"}
                    </span>
                  </span>
                  <StatusBadge
                    status={effectiveStatus(r.status, r.validade_em)}
                  />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos orçamentos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {latest.map((r) => (
            <Link
              key={r.id}
              href={`/orcamentos/${r.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{r.titulo}</span>
                <span className="text-muted-foreground text-xs">
                  {r.numero} · {clientName(r)}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <StatusBadge
                  status={effectiveStatus(r.status, r.validade_em)}
                />
                <Money value={Number(r.total)} />
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
