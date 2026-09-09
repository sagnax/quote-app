import { formatBRL, formatDateBR } from "@/lib/format";

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Normaliza para o formato exigido pelo wa.me (DDI+DDD+número, sem `+`).
 * Números nacionais BR (10–11 dígitos) ganham o 55; demais vão como estão.
 */
export function normalizePhone(phone: string): string {
  const digits = onlyDigits(phone).replace(/^0+/, "");
  if (digits.length >= 10 && digits.length <= 11) return `55${digits}`;
  return digits;
}

/** Link wa.me com texto pré-preenchido; sem telefone abre o seletor. */
export function buildWhatsAppLink(phone: string | null, text: string): string {
  const digits = phone ? normalizePhone(phone) : "";
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function buildQuoteShareText({
  clientName,
  numero,
  total,
  validadeEm,
  link,
}: {
  clientName: string;
  numero: string;
  total: number;
  validadeEm: string | null;
  link: string;
}): string {
  const lines = [
    `Olá ${clientName}! Segue o orçamento ${numero}: ${formatBRL(total)}.`,
  ];
  if (validadeEm) {
    lines.push(`Válido até ${formatDateBR(`${validadeEm}T00:00:00`)}.`);
  }
  lines.push("", link);
  return lines.join("\n");
}

export function buildPublicQuoteLink(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/q/${token}`;
}
