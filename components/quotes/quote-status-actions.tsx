"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  effectiveStatus,
  QUOTE_TRANSITIONS,
  type QuoteStatus,
  STATUS_META,
} from "@/lib/quotes";
import { createClient } from "@/lib/supabase/client";

export function QuoteStatusActions({
  quote,
}: {
  quote: {
    id: string;
    status: QuoteStatus;
    validade_em: string | null;
    numero: string;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const effective = effectiveStatus(quote.status, quote.validade_em);
  const allowed = QUOTE_TRANSITIONS[quote.status];

  async function onTransition(to: QuoteStatus) {
    if (to === "aprovado" && effective === "expirado") {
      toast.error("Orçamento vencido.", {
        description: "Renove a validade antes de aprovar.",
      });
      return;
    }
    setBusy(to);
    const supabase = createClient();
    const { error } = await supabase
      .from("quotes")
      .update({ status: to, updated_at: new Date().toISOString() })
      .eq("id", quote.id);
    setBusy(null);
    if (error) {
      toast.error("Não foi possível mudar o status.", {
        description: error.message,
      });
      return;
    }
    toast.success(`Orçamento ${STATUS_META[to].label.toLowerCase()}.`);
    router.refresh();
  }

  async function onDuplicate() {
    setBusy("duplicate");
    const supabase = createClient();
    try {
      const [{ data: sections }, { data: items }] = await Promise.all([
        supabase
          .from("quote_sections")
          .select("*")
          .eq("quote_id", quote.id)
          .order("ordem"),
        supabase
          .from("quote_items")
          .select("*")
          .eq("quote_id", quote.id)
          .order("ordem"),
      ]);
      const { data: full } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", quote.id)
        .single();
      if (!full) throw new Error("Orçamento não encontrado.");

      const { data: numero, error: numError } =
        await supabase.rpc("next_quote_number");
      if (numError) throw numError;

      const { data: copy, error: copyError } = await supabase
        .from("quotes")
        .insert({
          user_id: (full as { user_id: string }).user_id,
          client_id: (full as { client_id: string }).client_id,
          numero: numero as string,
          titulo: (full as { titulo: string }).titulo,
          status: "rascunho",
          validade_em: (full as { validade_em: string | null }).validade_em,
          prazo_execucao: (full as { prazo_execucao: string | null })
            .prazo_execucao,
          forma_pagamento: (full as { forma_pagamento: string | null })
            .forma_pagamento,
          desconto_tipo: (full as { desconto_tipo: string }).desconto_tipo,
          desconto_valor: (full as { desconto_valor: number }).desconto_valor,
          subtotal: (full as { subtotal: number }).subtotal,
          total: (full as { total: number }).total,
          observacoes: (full as { observacoes: string | null }).observacoes,
          condicoes: (full as { condicoes: string | null }).condicoes,
        })
        .select("id")
        .single();
      if (copyError) throw copyError;
      const newId = (copy as { id: string }).id;

      for (const section of (sections ?? []) as {
        id: string;
        titulo: string;
        ordem: number;
      }[]) {
        const { data: sec, error: secError } = await supabase
          .from("quote_sections")
          .insert({
            quote_id: newId,
            titulo: section.titulo,
            ordem: section.ordem,
          })
          .select("id")
          .single();
        if (secError) throw secError;
        const rows = (
          (items ?? []) as {
            section_id: string | null;
            descricao: string;
            tipo: string;
            qtd: number;
            unidade: string;
            preco_unit: number;
            ordem: number;
          }[]
        )
          .filter((it) => it.section_id === section.id)
          .map((it) => ({
            quote_id: newId,
            section_id: (sec as { id: string }).id,
            descricao: it.descricao,
            tipo: it.tipo,
            qtd: it.qtd,
            unidade: it.unidade,
            preco_unit: it.preco_unit,
            ordem: it.ordem,
          }));
        if (rows.length > 0) {
          const { error } = await supabase.from("quote_items").insert(rows);
          if (error) throw error;
        }
      }
      const loose = (
        (items ?? []) as {
          section_id: string | null;
          descricao: string;
          tipo: string;
          qtd: number;
          unidade: string;
          preco_unit: number;
          ordem: number;
        }[]
      )
        .filter((it) => it.section_id === null)
        .map((it) => ({
          quote_id: newId,
          section_id: null,
          descricao: it.descricao,
          tipo: it.tipo,
          qtd: it.qtd,
          unidade: it.unidade,
          preco_unit: it.preco_unit,
          ordem: it.ordem,
        }));
      if (loose.length > 0) {
        const { error } = await supabase.from("quote_items").insert(loose);
        if (error) throw error;
      }

      toast.success(`Cópia ${numero} criada como rascunho!`);
      router.push(`/orcamentos/${newId}`);
      router.refresh();
    } catch (err) {
      toast.error("Não foi possível duplicar.", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    setBusy("delete");
    const supabase = createClient();
    const { error } = await supabase.from("quotes").delete().eq("id", quote.id);
    setBusy(null);
    if (error) {
      toast.error("Não foi possível excluir.", { description: error.message });
      return;
    }
    toast.success("Orçamento excluído.");
    setDeleteOpen(false);
    router.push("/orcamentos");
    router.refresh();
  }

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      {allowed.map((to) => (
        <Button
          key={to}
          variant={
            to === "aprovado"
              ? "default"
              : to === "recusado"
                ? "destructive"
                : "outline"
          }
          size="sm"
          disabled={busy !== null}
          onClick={() => onTransition(to)}
        >
          {busy === to
            ? "Salvando…"
            : to === "pendente" && quote.status === "rascunho"
              ? "Enviar para aprovação"
              : to === "rascunho"
                ? "Voltar a rascunho"
                : STATUS_META[to].label}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={busy !== null}
        onClick={onDuplicate}
      >
        {busy === "duplicate" ? "Duplicando…" : "Duplicar"}
      </Button>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" disabled={busy !== null}>
            Excluir
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir orçamento {quote.numero}?</DialogTitle>
            <DialogDescription>
              Itens e etapas serão removidos junto. Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={busy !== null}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={busy !== null}
            >
              {busy === "delete" ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
