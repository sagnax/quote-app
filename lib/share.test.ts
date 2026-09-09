import { describe, expect, it } from "vitest";
import {
  buildPublicQuoteLink,
  buildQuoteShareText,
  buildWhatsAppLink,
  normalizePhone,
} from "@/lib/share";

describe("buildQuoteShareText", () => {
  it("inclui valor, validade e link", () => {
    const text = buildQuoteShareText({
      clientName: "Maria",
      numero: "2026-0001",
      total: 1500.5,
      validadeEm: "2026-09-24",
      link: "http://x/q/abc",
    });
    expect(text).toContain("Maria");
    expect(text).toContain("2026-0001");
    expect(text).toContain("1.500,50");
    expect(text).toContain("24/09/2026");
    expect(text).toContain("http://x/q/abc");
  });

  it("omite a linha de validade quando ausente", () => {
    const text = buildQuoteShareText({
      clientName: "Maria",
      numero: "1",
      total: 10,
      validadeEm: null,
      link: "L",
    });
    expect(text).not.toContain("Válido");
  });
});

describe("normalizePhone", () => {
  it("adiciona DDI 55 ao número nacional", () => {
    expect(normalizePhone("(11) 99999-9999")).toBe("5511999999999");
  });

  it("mantém número já internacional", () => {
    expect(normalizePhone("+55 11 99999-9999")).toBe("5511999999999");
  });
});

describe("buildWhatsAppLink", () => {
  it("usa o telefone quando há", () => {
    expect(buildWhatsAppLink("(11) 99999-9999", "oi")).toBe(
      `https://wa.me/5511999999999?text=${encodeURIComponent("oi")}`,
    );
  });

  it("abre o seletor sem telefone", () => {
    expect(
      buildWhatsAppLink(null, "oi").startsWith("https://wa.me/?text="),
    ).toBe(true);
  });
});

describe("buildPublicQuoteLink", () => {
  it("monta /q/[token] sem barra dupla", () => {
    expect(buildPublicQuoteLink("http://a/", "t")).toBe("http://a/q/t");
  });
});
