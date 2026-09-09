/** Períodos do dashboard. Módulo neutro (sem "use client") para poder ser
 * importado tanto por Server Components (page) quanto por Client Components
 * (filtros). Valores importados de arquivo "use client" chegam `undefined`
 * no servidor — nunca colocar constantes aqui em arquivos client. */

export type DashboardPeriod = "mes" | "anterior" | "90d";

export const PERIOD_LABEL: Record<DashboardPeriod, string> = {
  mes: "Mês atual",
  anterior: "Mês anterior",
  "90d": "Últimos 90 dias",
};

export const PERIOD_ORDER: DashboardPeriod[] = ["mes", "anterior", "90d"];
