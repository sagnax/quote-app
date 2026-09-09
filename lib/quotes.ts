import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

export type QuoteStatus =
  | "rascunho"
  | "pendente"
  | "aprovado"
  | "recusado"
  | "expirado";

export type ItemType = "servico" | "material" | "outro";

export const QUOTE_STATUSES: QuoteStatus[] = [
  "rascunho",
  "pendente",
  "aprovado",
  "recusado",
  "expirado",
];

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const STATUS_META: Record<
  QuoteStatus,
  { label: string; variant: BadgeVariant; dotClass: string }
> = {
  rascunho: {
    label: "Rascunho",
    variant: "secondary",
    dotClass: "bg-muted-foreground",
  },
  pendente: {
    label: "Pendente",
    variant: "outline",
    dotClass: "bg-warning",
  },
  aprovado: {
    label: "Aprovado",
    variant: "default",
    dotClass: "bg-success",
  },
  recusado: {
    label: "Recusado",
    variant: "destructive",
    dotClass: "bg-destructive",
  },
  expirado: {
    label: "Expirado",
    variant: "secondary",
    dotClass: "bg-foreground/40",
  },
};

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  servico: "Serviço",
  material: "Material",
  outro: "Outro",
};

export const UNIT_OPTIONS = ["un", "h", "m", "m²", "kg", "pct", "vb"] as const;

export type UnitOption = (typeof UNIT_OPTIONS)[number];

/** Transições manuais permitidas. Aprovado/recusado são terminais. */
export const QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  rascunho: ["pendente"],
  pendente: ["aprovado", "recusado", "rascunho"],
  aprovado: [],
  recusado: [],
  expirado: [],
};

export function canTransition(from: QuoteStatus, to: QuoteStatus): boolean {
  return QUOTE_TRANSITIONS[from].includes(to);
}

/**
 * Orçamento de rascunho/pendente com validade passada é tratado como expirado.
 * Aprovado/recusado mantêm o estado mesmo após a validade.
 */
export function isQuoteExpired(
  status: QuoteStatus,
  validadeEm: string | null,
): boolean {
  if (!validadeEm) return false;
  if (status !== "rascunho" && status !== "pendente") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${validadeEm}T00:00:00`) < today;
}

export function effectiveStatus(
  status: QuoteStatus,
  validadeEm: string | null,
): QuoteStatus {
  return isQuoteExpired(status, validadeEm) ? "expirado" : status;
}
