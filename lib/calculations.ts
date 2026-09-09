export type DiscountType = "valor" | "percentual";

export function calcItemTotal(qtd: number, precoUnit: number): number {
  if (!Number.isFinite(qtd) || !Number.isFinite(precoUnit)) return 0;
  if (qtd < 0 || precoUnit < 0) return 0;
  return Math.round(qtd * precoUnit * 100) / 100;
}

export function calcSubtotal(
  items: { qtd: number; precoUnit: number }[],
): number {
  return items.reduce(
    (acc, item) => acc + calcItemTotal(item.qtd, item.precoUnit),
    0,
  );
}

export function calcTotal(
  subtotal: number,
  descontoTipo: DiscountType,
  descontoValor: number,
): number {
  if (!Number.isFinite(subtotal) || subtotal < 0) return 0;
  if (!Number.isFinite(descontoValor) || descontoValor < 0) return subtotal;

  const desconto =
    descontoTipo === "percentual"
      ? (subtotal * descontoValor) / 100
      : descontoValor;

  const total = subtotal - desconto;
  return Math.round(Math.max(total, 0) * 100) / 100;
}
