import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/quotes/page-header";
import {
  QuoteDocument,
  type QuoteDocumentData,
} from "@/components/quotes/quote-document";
import { QuoteSharePanel } from "@/components/quotes/quote-share-panel";
import { Button } from "@/components/ui/button";
import { effectiveStatus, type QuoteStatus } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/server";
import type {
  QuoteItemRecord,
  QuoteRecord,
  QuoteSectionRecord,
} from "@/lib/validations/quote";

export const dynamic = "force-dynamic";

export default async function OrcamentoPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/orcamentos/${id}/preview`);

  const [
    { data: quoteRow },
    { data: sectionRows },
    { data: itemRows },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from("quotes")
      .select("*, clients(id, nome, telefone)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("quote_sections")
      .select("*")
      .eq("quote_id", id)
      .order("ordem"),
    supabase.from("quote_items").select("*").eq("quote_id", id).order("ordem"),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  if (!quoteRow) notFound();
  const quote = quoteRow as QuoteRecord & {
    clients: { id: string; nome: string; telefone: string | null } | null;
    public_token: string;
  };
  const sections = (sectionRows ?? []) as QuoteSectionRecord[];
  const items = (itemRows ?? []) as QuoteItemRecord[];
  const company = (profile ?? {}) as {
    company_name?: string | null;
    phone?: string | null;
    logo_url?: string | null;
  };

  const doc: QuoteDocumentData = {
    companyName: company.company_name ?? null,
    companyPhone: company.phone ?? null,
    logoUrl: company.logo_url ?? null,
    numero: quote.numero,
    titulo: quote.titulo,
    status: effectiveStatus(quote.status as QuoteStatus, quote.validade_em),
    validadeEm: quote.validade_em,
    prazoExecucao: quote.prazo_execucao,
    formaPagamento: quote.forma_pagamento,
    condicoes: quote.condicoes,
    descontoTipo: quote.desconto_tipo,
    descontoValor: Number(quote.desconto_valor),
    subtotal: Number(quote.subtotal),
    total: Number(quote.total),
    clientName: quote.clients?.nome ?? "—",
    sections: sections.map((s) => ({
      titulo: s.titulo,
      items: items
        .filter((it) => it.section_id === s.id)
        .map((it) => ({
          descricao: it.descricao,
          tipo: it.tipo,
          qtd: Number(it.qtd),
          unidade: it.unidade,
          preco_unit: Number(it.preco_unit),
        })),
    })),
    looseItems: items
      .filter((it) => it.section_id === null)
      .map((it) => ({
        descricao: it.descricao,
        tipo: it.tipo,
        qtd: Number(it.qtd),
        unidade: it.unidade,
        preco_unit: Number(it.preco_unit),
      })),
  };

  return (
    <>
      <PageHeader
        title={`Preview — ${quote.numero}`}
        description="Como o cliente vê. Use Imprimir para gerar o PDF."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/orcamentos/${id}`}>Voltar à edição</Link>
          </Button>
        }
      />
      <QuoteSharePanel
        quoteId={quote.id}
        token={quote.public_token}
        numero={quote.numero}
        total={Number(quote.total)}
        validadeEm={quote.validade_em}
        clientName={quote.clients?.nome ?? ""}
        clientPhone={quote.clients?.telefone ?? null}
      />
      <QuoteDocument doc={doc} />
    </>
  );
}
