import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Money } from "@/components/quotes/money";
import { PageHeader } from "@/components/quotes/page-header";
import { type QuoteDraft, QuoteForm } from "@/components/quotes/quote-form";
import { QuoteStatusActions } from "@/components/quotes/quote-status-actions";
import { StatusBadge } from "@/components/quotes/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/lib/format";
import { effectiveStatus, type QuoteStatus } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/server";
import type {
  QuoteItemRecord,
  QuoteRecord,
  QuoteSectionRecord,
} from "@/lib/validations/quote";

export const dynamic = "force-dynamic";

export default async function OrcamentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/orcamentos/${id}`);

  const [
    { data: quoteRow },
    { data: sectionRows },
    { data: itemRows },
    { data: clients },
  ] = await Promise.all([
    supabase
      .from("quotes")
      .select("*, clients(id, nome)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("quote_sections")
      .select("*")
      .eq("quote_id", id)
      .order("ordem"),
    supabase.from("quote_items").select("*").eq("quote_id", id).order("ordem"),
    supabase.from("clients").select("id, nome").order("nome"),
  ]);

  if (!quoteRow) notFound();
  const quote = quoteRow as QuoteRecord & {
    clients: { id: string; nome: string } | null;
  };
  const sections = (sectionRows ?? []) as QuoteSectionRecord[];
  const items = (itemRows ?? []) as QuoteItemRecord[];

  const initial: QuoteDraft = {
    clientId: quote.client_id,
    titulo: quote.titulo,
    validadeEm: quote.validade_em ?? "",
    prazoExecucao: quote.prazo_execucao ?? "",
    formaPagamento: quote.forma_pagamento ?? "",
    descontoTipo: quote.desconto_tipo,
    descontoValor: Number(quote.desconto_valor),
    observacoes: quote.observacoes ?? "",
    condicoes: quote.condicoes ?? "",
    sections: sections.map((s) => ({
      titulo: s.titulo,
      items: items
        .filter((it) => it.section_id === s.id)
        .map((it) => ({
          descricao: it.descricao,
          tipo: it.tipo as QuoteDraft["sections"][number]["items"][number]["tipo"],
          qtd: Number(it.qtd),
          unidade: it.unidade,
          preco_unit: Number(it.preco_unit),
        })),
    })),
    looseItems: items
      .filter((it) => it.section_id === null)
      .map((it) => ({
        descricao: it.descricao,
        tipo: it.tipo as QuoteDraft["looseItems"][number]["tipo"],
        qtd: Number(it.qtd),
        unidade: it.unidade,
        preco_unit: Number(it.preco_unit),
      })),
  };

  const effective = effectiveStatus(
    quote.status as QuoteStatus,
    quote.validade_em,
  );

  return (
    <>
      <PageHeader
        title={`${quote.numero} — ${quote.titulo}`}
        description={quote.clients?.nome ?? "—"}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/orcamentos">Voltar</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/orcamentos/${id}/preview`}>Preview / PDF</Link>
            </Button>
            <QuoteStatusActions
              quote={{
                id: quote.id,
                status: quote.status as QuoteStatus,
                validade_em: quote.validade_em,
                numero: quote.numero,
              }}
            />
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={effective} />
        {quote.validade_em ? (
          <span className="text-muted-foreground text-sm">
            Válido até {formatDateBR(`${quote.validade_em}T00:00:00`)}
          </span>
        ) : null}
        <Money
          value={Number(quote.total)}
          className="font-semibold text-base"
        />
      </div>
      <QuoteForm
        mode="edit"
        clients={(clients ?? []) as { id: string; nome: string }[]}
        quoteId={quote.id}
        initial={initial}
      />
    </>
  );
}
