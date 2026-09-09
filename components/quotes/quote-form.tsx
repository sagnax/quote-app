"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ClientQuickCreate } from "@/components/clientes/client-quick-create";
import {
  type ItemDraft,
  ItemTable,
  newItemDraft,
} from "@/components/quotes/item-table";
import { Money } from "@/components/quotes/money";
import { TotalsPanel } from "@/components/quotes/totals-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { calcSubtotal, calcTotal, type DiscountType } from "@/lib/calculations";
import { createClient } from "@/lib/supabase/client";
import {
  isEmptyQuoteRow,
  quoteHeaderSchema,
  quoteItemSchema,
} from "@/lib/validations/quote";

export type QuoteDraftItem = {
  descricao: string;
  tipo: "servico" | "material" | "outro";
  qtd: number;
  unidade: string;
  preco_unit: number;
};

export type QuoteDraft = {
  clientId: string;
  titulo: string;
  validadeEm: string;
  prazoExecucao: string;
  formaPagamento: string;
  descontoTipo: DiscountType;
  descontoValor: number;
  observacoes: string;
  condicoes: string;
  sections: { titulo: string; items: QuoteDraftItem[] }[];
  looseItems: QuoteDraftItem[];
};

type SectionDraft = { key: string; titulo: string; items: ItemDraft[] };

function toDraft(items: QuoteDraftItem[]): ItemDraft[] {
  return items.map((i) => ({ ...i, key: crypto.randomUUID() }));
}

export function QuoteForm({
  mode,
  clients,
  quoteId,
  initial,
  defaults,
}: {
  mode: "create" | "edit";
  clients: { id: string; nome: string }[];
  quoteId?: string;
  initial?: QuoteDraft;
  defaults?: { validadeEm: string; condicoes: string };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [localClients, setLocalClients] = useState(clients);
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [validadeEm, setValidadeEm] = useState(
    initial?.validadeEm ?? defaults?.validadeEm ?? "",
  );
  const [prazoExecucao, setPrazoExecucao] = useState(
    initial?.prazoExecucao ?? "",
  );
  const [formaPagamento, setFormaPagamento] = useState(
    initial?.formaPagamento ?? "",
  );
  const [descontoTipo, setDescontoTipo] = useState<DiscountType>(
    initial?.descontoTipo ?? "valor",
  );
  const [descontoValor, setDescontoValor] = useState(
    initial?.descontoValor ?? 0,
  );
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");
  const [condicoes, setCondicoes] = useState(
    initial?.condicoes ?? defaults?.condicoes ?? "",
  );

  const [looseItems, setLooseItems] = useState<ItemDraft[]>(() =>
    toDraft(initial?.looseItems ?? [newItemDraft()]),
  );
  const [sections, setSections] = useState<SectionDraft[]>(() =>
    (initial?.sections ?? []).map((s) => ({
      key: crypto.randomUUID(),
      titulo: s.titulo,
      items: toDraft(s.items.length ? s.items : [newItemDraft()]),
    })),
  );

  const allItems = useMemo(
    () => [...looseItems, ...sections.flatMap((s) => s.items)],
    [looseItems, sections],
  );
  const subtotal = useMemo(
    () =>
      calcSubtotal(
        allItems.map((i) => ({ qtd: i.qtd, precoUnit: i.preco_unit })),
      ),
    [allItems],
  );
  const total = useMemo(
    () => calcTotal(subtotal, descontoTipo, descontoValor),
    [subtotal, descontoTipo, descontoValor],
  );

  function validate(): {
    loose: QuoteDraftItem[];
    sections: { titulo: string; items: QuoteDraftItem[] }[];
  } | null {
    const header = quoteHeaderSchema.safeParse({
      client_id: clientId,
      titulo,
      validade_em: validadeEm || undefined,
      prazo_execucao: prazoExecucao || undefined,
      forma_pagamento: formaPagamento || undefined,
      desconto_tipo: descontoTipo,
      desconto_valor: descontoValor,
      observacoes: observacoes || undefined,
      condicoes: condicoes || undefined,
    });
    if (!header.success) {
      const errs: Record<string, string> = {};
      for (const issue of header.error.issues) {
        const key = String(issue.path[0] ?? "form");
        errs[key] ??= issue.message;
      }
      setFieldErrors(errs);
      toast.error("Revise os dados do orçamento.", {
        description: "Há campos inválidos no cabeçalho.",
      });
      return null;
    }
    setFieldErrors({});

    const groups: {
      label: string;
      items: ItemDraft[];
      titulo: string | null;
    }[] = [
      { label: "Itens gerais", items: looseItems, titulo: null },
      ...sections.map((s, i) => ({
        label: s.titulo.trim()
          ? `Etapa "${s.titulo.trim()}"`
          : `Etapa ${i + 1}`,
        items: s.items,
        titulo: s.titulo.trim() || null,
      })),
    ];
    const loose: QuoteDraftItem[] = [];
    const effSections: { titulo: string; items: QuoteDraftItem[] }[] = [];
    for (const group of groups) {
      const parsedItems: QuoteDraftItem[] = [];
      let failed = false;
      group.items
        .filter((it) => !isEmptyQuoteRow(it))
        .forEach((item, idx) => {
          const parsed = quoteItemSchema.safeParse({
            descricao: item.descricao,
            tipo: item.tipo,
            qtd: item.qtd,
            unidade: item.unidade,
            preco_unit: item.preco_unit,
          });
          if (!parsed.success) {
            failed = true;
            toast.error(`Revise ${group.label} — item ${idx + 1}.`, {
              description: parsed.error.issues[0]?.message ?? "Item inválido.",
            });
            return;
          }
          parsedItems.push(parsed.data);
        });
      if (failed) throw new Error("validation");
      if (parsedItems.length === 0) continue; // grupo vazio: ignora em silêncio
      if (group.titulo === null) {
        loose.push(...parsedItems);
        continue;
      }
      if (group.titulo === "") {
        toast.error(`Dê um título à ${group.label}.`);
        return null;
      }
      effSections.push({ titulo: group.titulo, items: parsedItems });
    }
    if (
      loose.length + effSections.reduce((n, s) => n + s.items.length, 0) ===
      0
    ) {
      toast.error("Adicione ao menos 1 item ao orçamento.");
      return null;
    }
    return { loose, sections: effSections };
  }

  async function insertSectionsAndItems(
    supabase: ReturnType<typeof createClient>,
    qid: string,
    data: {
      loose: QuoteDraftItem[];
      sections: { titulo: string; items: QuoteDraftItem[] }[];
    },
  ) {
    let ordem = 0;
    for (const section of data.sections) {
      const { data: sec, error: secError } = await supabase
        .from("quote_sections")
        .insert({ quote_id: qid, titulo: section.titulo, ordem })
        .select("id")
        .single();
      if (secError) throw secError;
      const rows = section.items.map((it, idx) => ({
        ...it,
        quote_id: qid,
        section_id: (sec as { id: string }).id,
        ordem: idx,
      }));
      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(rows);
      if (itemsError) throw itemsError;
      ordem++;
    }
    if (data.loose.length > 0) {
      const rows = data.loose.map((it, idx) => ({
        ...it,
        quote_id: qid,
        section_id: null,
        ordem: idx,
      }));
      const { error } = await supabase.from("quote_items").insert(rows);
      if (error) throw error;
    }
  }

  async function onSave() {
    let data: {
      loose: QuoteDraftItem[];
      sections: { titulo: string; items: QuoteDraftItem[] }[];
    } | null;
    try {
      data = validate();
    } catch {
      return;
    }
    if (!data) return;

    setSaving(true);
    const supabase = createClient();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada. Entre novamente.");

      const base = {
        user_id: user.id,
        client_id: clientId,
        titulo: titulo.trim(),
        validade_em: validadeEm || null,
        prazo_execucao: prazoExecucao.trim() || null,
        forma_pagamento: formaPagamento.trim() || null,
        desconto_tipo: descontoTipo,
        desconto_valor: descontoValor,
        subtotal,
        total,
        observacoes: observacoes.trim() || null,
        condicoes: condicoes.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (mode === "create") {
        // Numeração atômica via RPC; em corrida de unique, regenera 1x.
        let numero: string | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          const { data: num, error: numError } =
            await supabase.rpc("next_quote_number");
          if (numError) throw numError;
          numero = num as string;
          const { data: quote, error } = await supabase
            .from("quotes")
            .insert({ ...base, numero, status: "rascunho" })
            .select("id")
            .single();
          if (!error) {
            await insertSectionsAndItems(
              supabase,
              (quote as { id: string }).id,
              data,
            );
            toast.success(`Orçamento ${numero} criado!`);
            router.push(`/orcamentos/${(quote as { id: string }).id}`);
            router.refresh();
            return;
          }
          if ((error as { code?: string }).code !== "23505" || attempt === 1)
            throw error;
        }
      } else {
        if (!quoteId) throw new Error("Orçamento sem id.");
        const { error } = await supabase
          .from("quotes")
          .update(base)
          .eq("id", quoteId);
        if (error) throw error;
        const { error: delItems } = await supabase
          .from("quote_items")
          .delete()
          .eq("quote_id", quoteId);
        if (delItems) throw delItems;
        const { error: delSections } = await supabase
          .from("quote_sections")
          .delete()
          .eq("quote_id", quoteId);
        if (delSections) throw delSections;
        await insertSectionsAndItems(supabase, quoteId, data);
        toast.success("Orçamento salvo!");
        router.refresh();
      }
    } catch (err) {
      toast.error("Não foi possível salvar.", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
      <Tabs defaultValue="cliente">
        <TabsList className="no-print grid w-full grid-cols-3">
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="condicoes">Condições</TabsTrigger>
        </TabsList>

        <TabsContent value="cliente">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="grid gap-1.5">
                <Label htmlFor="quote-client">Cliente</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger id="quote-client" className="flex-1">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {localClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ClientQuickCreate
                    onCreated={(c) => {
                      setLocalClients((prev) =>
                        [...prev, { id: c.id, nome: c.nome }].sort((a, b) =>
                          a.nome.localeCompare(b.nome, "pt-BR"),
                        ),
                      );
                      setClientId(c.id);
                    }}
                  />
                </div>
                {fieldErrors.client_id ? (
                  <p className="text-destructive text-sm">
                    {fieldErrors.client_id}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="quote-titulo">Título do orçamento</Label>
                <Input
                  id="quote-titulo"
                  placeholder="Ex: Reforma da sala comercial"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                {fieldErrors.titulo ? (
                  <p className="text-destructive text-sm">
                    {fieldErrors.titulo}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5 sm:max-w-60">
                <Label htmlFor="quote-validade">Válido até</Label>
                <Input
                  id="quote-validade"
                  type="date"
                  value={validadeEm}
                  onChange={(e) => setValidadeEm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itens" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Itens gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemTable items={looseItems} onChange={setLooseItems} />
            </CardContent>
          </Card>
          {sections.map((section) => (
            <Card key={section.key}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Título da etapa"
                    placeholder="Ex: Etapa 1 — Fundação"
                    value={section.titulo}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s) =>
                          s.key === section.key
                            ? { ...s, titulo: e.target.value }
                            : s,
                        ),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover etapa"
                    onClick={() =>
                      setSections((prev) =>
                        prev.filter((s) => s.key !== section.key),
                      )
                    }
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ItemTable
                  items={section.items}
                  onChange={(items) =>
                    setSections((prev) =>
                      prev.map((s) =>
                        s.key === section.key ? { ...s, items } : s,
                      ),
                    )
                  }
                />
              </CardContent>
            </Card>
          ))}
          <div>
            <Button
              variant="outline"
              onClick={() =>
                setSections((prev) => [
                  ...prev,
                  {
                    key: crypto.randomUUID(),
                    titulo: "",
                    items: [newItemDraft()],
                  },
                ])
              }
            >
              <Plus aria-hidden />
              Adicionar etapa
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="condicoes">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="quote-prazo">Prazo de execução</Label>
                  <Input
                    id="quote-prazo"
                    placeholder="Ex: 15 dias úteis"
                    value={prazoExecucao}
                    onChange={(e) => setPrazoExecucao(e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="quote-pagto">Forma de pagamento</Label>
                  <Input
                    id="quote-pagto"
                    placeholder="Ex: 50% entrada + 50% na entrega"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="quote-cond">
                  Condições e observações comerciais
                </Label>
                <Textarea
                  id="quote-cond"
                  rows={4}
                  value={condicoes}
                  onChange={(e) => setCondicoes(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="quote-obs">Observações internas</Label>
                <Textarea
                  id="quote-obs"
                  rows={3}
                  placeholder="Não aparece no PDF do cliente (F4 definirá visibilidade)."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TotalsPanel
        subtotal={subtotal}
        descontoTipo={descontoTipo}
        onDescontoTipo={setDescontoTipo}
        descontoValor={descontoValor}
        onDescontoValor={setDescontoValor}
        total={total}
        saveLabel={mode === "create" ? "Criar orçamento" : "Salvar alterações"}
        saving={saving}
        onSave={onSave}
      />
      <p className="text-muted-foreground text-xs lg:col-start-2">
        Subtotal de {allItems.length} {allItems.length === 1 ? "item" : "itens"}{" "}
        · <Money value={total} className="text-xs" />
      </p>
    </div>
  );
}
