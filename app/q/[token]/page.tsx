import { notFound } from "next/navigation";
import { PrintButton } from "@/components/quotes/print-button";
import {
  QuoteDocument,
  type QuoteDocumentData,
} from "@/components/quotes/quote-document";
import { StatusBadge } from "@/components/quotes/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicQuotePayload } from "@/lib/public-quote";
import { effectiveStatus } from "@/lib/quotes";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_public_quote", {
    p_token: token,
  });
  const payload = (data ?? { status: "not_found" }) as PublicQuotePayload;

  if (error || payload.status === "not_found") notFound();

  if (payload.status === "expired") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Orçamento {payload.numero} expirado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              {payload.company?.name ?? "A empresa"} informa que este orçamento
              passou da validade e os valores não estão mais disponíveis.
            </p>
            <p className="text-sm">
              Solicite uma atualização
              {payload.company?.phone
                ? ` pelo telefone ${payload.company.phone}`
                : ""}
              .
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const doc: QuoteDocumentData = {
    companyName: payload.company?.name ?? null,
    companyPhone: payload.company?.phone ?? null,
    logoUrl: payload.company?.logo_url ?? null,
    numero: payload.numero,
    titulo: payload.titulo,
    status: effectiveStatus(payload.quote_status, payload.validade_em),
    validadeEm: payload.validade_em,
    prazoExecucao: payload.prazo_execucao,
    formaPagamento: payload.forma_pagamento,
    condicoes: payload.condicoes,
    descontoTipo: payload.desconto_tipo,
    descontoValor: Number(payload.desconto_valor),
    subtotal: Number(payload.subtotal),
    total: Number(payload.total),
    clientName: payload.client?.nome ?? "—",
    sections: payload.sections.map((s) => ({
      titulo: s.titulo,
      items: s.items.map((it) => ({ ...it })),
    })),
    looseItems: payload.loose_items.map((it) => ({ ...it })),
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8">
      <div className="no-print flex items-center justify-between">
        <StatusBadge status={doc.status} />
        <PrintButton />
      </div>
      <QuoteDocument doc={doc} />
    </div>
  );
}
