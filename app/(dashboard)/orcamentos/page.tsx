import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/quotes/empty-state";
import { Money } from "@/components/quotes/money";
import { PageHeader } from "@/components/quotes/page-header";
import { QuoteFilters } from "@/components/quotes/quote-filters";
import { StatusBadge } from "@/components/quotes/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateBR } from "@/lib/format";
import { effectiveStatus, type QuoteStatus } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function escapeIlike(value: string) {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const query = q?.trim() ?? "";
  const statusFilter = (status ?? "") as QuoteStatus | "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orcamentos");

  let db = supabase
    .from("quotes")
    .select("*, clients(id, nome)")
    .order("created_at", { ascending: false });

  if (query) {
    const pattern = `%${escapeIlike(query)}%`;
    db = db.or(`numero.ilike.${pattern},titulo.ilike.${pattern}`);
  }

  const { data, error } = await db;

  const rows = (data ?? []) as {
    id: string;
    numero: string;
    titulo: string;
    status: QuoteStatus;
    validade_em: string | null;
    total: number | string;
    clients: { id: string; nome: string } | null;
  }[];

  // Nome do cliente filtra em memória (join simples para o volume do MVP).
  const filtered = rows.filter((row) => {
    if (query) {
      const hay =
        `${row.numero} ${row.titulo} ${row.clients?.nome ?? ""}`.toLowerCase();
      if (!hay.includes(query.toLowerCase())) return false;
    }
    if (statusFilter) {
      if (effectiveStatus(row.status, row.validade_em) !== statusFilter)
        return false;
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Orçamentos"
        description="Gerencie propostas, status e valores."
        actions={
          <Button asChild>
            <Link href="/orcamentos/novo">
              <Plus aria-hidden />
              Novo orçamento
            </Link>
          </Button>
        }
      />
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          Não foi possível carregar os orçamentos: {error.message}
        </p>
      ) : null}
      <QuoteFilters initialQuery={query} initialStatus={statusFilter} />
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            query || statusFilter
              ? "Nenhum orçamento encontrado"
              : "Nenhum orçamento ainda"
          }
          description={
            query || statusFilter
              ? "Ajuste a busca ou o filtro de status."
              : "Crie o primeiro orçamento com cálculo automático de totais."
          }
          action={
            !query && !statusFilter ? (
              <Button size="sm" asChild>
                <Link href="/orcamentos/novo">
                  <Plus aria-hidden />
                  Criar orçamento
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Título / Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono tabular">
                      <Link
                        href={`/orcamentos/${row.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {row.numero}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/orcamentos/${row.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {row.titulo}
                      </Link>
                      <span className="block text-muted-foreground text-xs">
                        {row.clients?.nome ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={effectiveStatus(row.status, row.validade_em)}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.validade_em
                        ? formatDateBR(`${row.validade_em}T00:00:00`)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Money value={Number(row.total)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
