import { z } from "zod";

export const quoteItemSchema = z.object({
  descricao: z.string().trim().min(2, "Descreva o item ou serviço."),
  tipo: z.enum(["servico", "material", "outro"]),
  qtd: z
    .number("Informe a quantidade.")
    .positive("Qtd deve ser maior que zero."),
  unidade: z.string().trim().min(1, "Unidade obrigatória.").max(10),
  preco_unit: z
    .number("Informe o preço unitário.")
    .min(0, "Preço não pode ser negativo."),
});

export type QuoteItemValues = z.infer<typeof quoteItemSchema>;

export const quoteHeaderSchema = z.object({
  client_id: z.string().uuid("Selecione o cliente."),
  titulo: z
    .string()
    .trim()
    .min(3, "Dê um título ao orçamento.")
    .max(120, "Título muito longo."),
  validade_em: z.string().optional(),
  prazo_execucao: z.string().trim().max(120).optional(),
  forma_pagamento: z.string().trim().max(200).optional(),
  desconto_tipo: z.enum(["valor", "percentual"]),
  desconto_valor: z
    .number("Informe o desconto.")
    .min(0, "Desconto não pode ser negativo."),
  observacoes: z.string().trim().max(2000).optional(),
  condicoes: z.string().trim().max(2000).optional(),
});

export type QuoteHeaderValues = z.infer<typeof quoteHeaderSchema>;

/**
 * Linha intocada (só o rascunho inicial da grade): deve ser ignorada na
 * validação e no salvamento, nunca bloquear o submit.
 */
export function isEmptyQuoteRow(row: {
  descricao: string;
  preco_unit: number;
  qtd: number;
}): boolean {
  return (
    row.descricao.trim() === "" &&
    row.preco_unit === 0 &&
    (row.qtd === 0 || row.qtd === 1)
  );
}

export type QuoteRecord = {
  id: string;
  user_id: string;
  client_id: string;
  numero: string;
  titulo: string;
  status: string;
  validade_em: string | null;
  prazo_execucao: string | null;
  forma_pagamento: string | null;
  desconto_tipo: "valor" | "percentual";
  desconto_valor: number;
  subtotal: number;
  total: number;
  observacoes: string | null;
  condicoes: string | null;
  public_token: string;
  created_at: string;
  updated_at: string;
};

export type QuoteSectionRecord = {
  id: string;
  quote_id: string;
  titulo: string;
  ordem: number;
};

export type QuoteItemRecord = {
  id: string;
  quote_id: string;
  section_id: string | null;
  descricao: string;
  tipo: string;
  qtd: number;
  unidade: string;
  preco_unit: number;
  ordem: number;
};
