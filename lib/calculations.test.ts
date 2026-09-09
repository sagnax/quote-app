import { describe, expect, it } from "vitest";
import { calcItemTotal, calcSubtotal, calcTotal } from "@/lib/calculations";

describe("calcItemTotal", () => {
  it("multiplica qtd por preço", () => {
    expect(calcItemTotal(45, 38)).toBe(1710);
  });

  it("arredonda para 2 casas", () => {
    expect(calcItemTotal(3, 19.99)).toBeCloseTo(59.97, 2);
  });

  it("zera valores negativos ou inválidos", () => {
    expect(calcItemTotal(-1, 10)).toBe(0);
    expect(calcItemTotal(1, -10)).toBe(0);
    expect(calcItemTotal(Number.NaN, 10)).toBe(0);
  });
});

describe("calcSubtotal", () => {
  it("soma os itens", () => {
    expect(
      calcSubtotal([
        { qtd: 45, precoUnit: 38 },
        { qtd: 6, precoUnit: 289.9 },
        { qtd: 8, precoUnit: 65 },
      ]),
    ).toBeCloseTo(3969.4, 2);
  });

  it("lista vazia zera", () => {
    expect(calcSubtotal([])).toBe(0);
  });
});

describe("calcTotal", () => {
  it("desconto em valor", () => {
    expect(calcTotal(1000, "valor", 100)).toBe(900);
  });

  it("desconto percentual", () => {
    expect(calcTotal(3969.4, "percentual", 5)).toBeCloseTo(3770.93, 2);
  });

  it("nunca fica negativo", () => {
    expect(calcTotal(100, "valor", 9999)).toBe(0);
    expect(calcTotal(100, "percentual", 200)).toBe(0);
  });

  it("desconto inválido mantém o subtotal", () => {
    expect(calcTotal(100, "valor", -5)).toBe(100);
    expect(calcTotal(100, "valor", Number.NaN)).toBe(100);
  });
});
