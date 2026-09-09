import { describe, expect, it } from "vitest";
import { canTransition, effectiveStatus, isQuoteExpired } from "@/lib/quotes";

describe("canTransition", () => {
  it("rascunho só vai para pendente", () => {
    expect(canTransition("rascunho", "pendente")).toBe(true);
    expect(canTransition("rascunho", "aprovado")).toBe(false);
  });

  it("pendente aprova, recusa ou volta", () => {
    expect(canTransition("pendente", "aprovado")).toBe(true);
    expect(canTransition("pendente", "recusado")).toBe(true);
    expect(canTransition("pendente", "rascunho")).toBe(true);
  });

  it("aprovado e recusado são terminais", () => {
    expect(canTransition("aprovado", "pendente")).toBe(false);
    expect(canTransition("recusado", "pendente")).toBe(false);
  });
});

describe("effectiveStatus", () => {
  it("pendente vencido vira expirado", () => {
    expect(effectiveStatus("pendente", "2020-01-01")).toBe("expirado");
  });

  it("rascunho futuro mantém o estado", () => {
    expect(effectiveStatus("rascunho", "2099-01-01")).toBe("rascunho");
  });

  it("aprovado vencido não expira", () => {
    expect(effectiveStatus("aprovado", "2020-01-01")).toBe("aprovado");
  });

  it("sem validade nunca expira", () => {
    expect(isQuoteExpired("pendente", null)).toBe(false);
  });
});
