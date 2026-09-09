import type { DiscountType } from "@/lib/calculations";
import type { QuoteStatus } from "@/lib/quotes";

export type PublicCompany = {
  name: string | null;
  phone: string | null;
  logo_url: string | null;
};

export type PublicItem = {
  descricao: string;
  tipo: string;
  qtd: number | string;
  unidade: string;
  preco_unit: number | string;
};

export type PublicSection = {
  titulo: string;
  items: PublicItem[];
};

export type PublicQuoteOk = {
  status: "ok";
  numero: string;
  titulo: string;
  quote_status: QuoteStatus;
  validade_em: string | null;
  prazo_execucao: string | null;
  forma_pagamento: string | null;
  desconto_tipo: DiscountType;
  desconto_valor: number | string;
  subtotal: number | string;
  total: number | string;
  condicoes: string | null;
  company: PublicCompany | null;
  client: { nome: string } | null;
  sections: PublicSection[];
  loose_items: PublicItem[];
};

export type PublicQuoteExpired = {
  status: "expired";
  numero: string;
  company: PublicCompany | null;
};

export type PublicQuoteNotFound = {
  status: "not_found";
};

export type PublicQuotePayload =
  | PublicQuoteOk
  | PublicQuoteExpired
  | PublicQuoteNotFound;
