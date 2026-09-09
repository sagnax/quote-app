import { describe, expect, it } from "vitest";
import {
  isEmptyQuoteRow,
  quoteHeaderSchema,
  quoteItemSchema,
} from "@/lib/validations/quote";

describe("isEmptyQuoteRow", () => {
  it("ignora o rascunho inicial", () => {
    expect(isEmptyQuoteRow({ descricao: "", preco_unit: 0, qtd: 1 })).toBe(
      true,
    );
  });

  it("ignora linha zerada com espaços", () => {
    expect(isEmptyQuoteRow({ descricao: "  ", preco_unit: 0, qtd: 0 })).toBe(
      true,
    );
  });

  it("não ignora linha preenchida", () => {
    expect(
      isEmptyQuoteRow({ descricao: "Pintura", preco_unit: 0, qtd: 1 }),
    ).toBe(false);
  });

  it("não ignora preço sem descrição (erro de preenchimento)", () => {
    expect(isEmptyQuoteRow({ descricao: "", preco_unit: 50, qtd: 1 })).toBe(
      false,
    );
  });

  it("não ignora qtd alterada sem descrição", () => {
    expect(isEmptyQuoteRow({ descricao: "", preco_unit: 0, qtd: 5 })).toBe(
      false,
    );
  });
});

describe("quoteHeaderSchema", () => {
  it("exige cliente e título", () => {
    const result = quoteHeaderSchema.safeParse({
      client_id: "não-uuid",
      titulo: "OK",
      desconto_tipo: "valor",
      desconto_valor: 0,
    });
    expect(result.success).toBe(false);
  });

  it("aceita cabeçalho mínimo válido", () => {
    const result = quoteHeaderSchema.safeParse({
      client_id: "00000000-0000-0000-0000-000000000000",
      titulo: "Reforma da sala",
      desconto_tipo: "percentual",
      desconto_valor: 10,
    });
    expect(result.success).toBe(true);
  });
});

describe("quoteItemSchema", () => {
  it("rejeita qtd zerada e preço negativo", () => {
    expect(
      quoteItemSchema.safeParse({
        descricao: "X",
        tipo: "servico",
        qtd: 0,
        unidade: "un",
        preco_unit: -1,
      }).success,
    ).toBe(false);
  });
});
