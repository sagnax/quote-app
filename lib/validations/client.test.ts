import { describe, expect, it } from "vitest";
import { clientSchema } from "@/lib/validations/client";

describe("clientSchema", () => {
  it("exige nome com 2+ letras", () => {
    expect(clientSchema.safeParse({ nome: "A", tipo: "pf" }).success).toBe(
      false,
    );
  });

  it("aceita só nome + tipo", () => {
    expect(
      clientSchema.safeParse({ nome: "Maria Silva", tipo: "pf" }).success,
    ).toBe(true);
  });

  it("rejeita e-mail inválido e tipo inválido", () => {
    expect(
      clientSchema.safeParse({
        nome: "Maria",
        tipo: "pf",
        email: "sem-arroba",
      }).success,
    ).toBe(false);
    expect(clientSchema.safeParse({ nome: "Maria", tipo: "xx" }).success).toBe(
      false,
    );
  });
});
