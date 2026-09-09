import { describe, expect, it } from "vitest";
import { formatBRL, formatDateBR, formatQuoteNumber } from "@/lib/format";

describe("formatBRL", () => {
  it("formata em reais", () => {
    expect(formatBRL(1500.5)).toContain("1.500,50");
  });

  it("zera sem quebrar", () => {
    expect(formatBRL(0)).toContain("0,00");
  });
});

describe("formatDateBR", () => {
  it("formata data curta", () => {
    expect(formatDateBR(new Date(2026, 8, 24))).toContain("24/09/2026");
  });

  it("aceita string ISO", () => {
    expect(formatDateBR("2026-09-24T00:00:00")).toContain("24/09/2026");
  });
});

describe("formatQuoteNumber", () => {
  it("preenche sequência com zeros", () => {
    expect(formatQuoteNumber(2026, 1)).toBe("2026-0001");
    expect(formatQuoteNumber(2026, 42)).toBe("2026-0042");
  });
});
