# PRD F5 — Dashboard + Polish + Testes

Status: **concluído e verificado (testes + build + E2E)**.

## 1. Objetivo

Dar visão do funil (pendentes/aprovados/conversão) e elevar o MVP a padrão de acabamento: responsivo, estados vazios/erro, performance e cobertura de testes do núcleo.

## 2. Escopo

Inclui:
- `/dashboard`: KPIs (total pendente R$, aprovado no mês R$, taxa de conversão %, ticket médio), últimos orçamentos, próximos vencimentos; gráficos com tokens `chart-1..5` (adiar lib de charts se simples: cards + barras CSS primeiro; Recharts só se preciso).
- Filtros globais por período (mês atual/anterior, 90 dias).
- Polish: `Skeleton` nos carregamentos, `EmptyState` em todas as listas, toasts consistentes, responsivo mobile (ações com polegar), dark mode básico validado (tokens já existem).
- Testes: Vitest para `lib/calculations.ts` + `lib/format.ts` (casos: desconto %, valor, total zerado, qtd/preço negativos, formatação BRL); smoke do fluxo criar→aprovar se viável.
- Limpeza: remover demo do D0 de `/` ou converter `/` em landing → redirect para `/dashboard` quando logado.

Fora do escopo: financeiro/contas a receber, estoque, multi-empresa, PWA/offline total, notificações automáticas de vencimento (fase 2+).

## 3. Critérios de aceite

- [x] Dashboard carrega com dados reais e estados vazios corretos (KPIs, barras 6 meses, vencendo 15 dias, últimos 5; E2E da consulta + agregações).
- [x] Testes formais verdes: `npm test` (Vitest, 39 testes em 6 arquivos: calculations, format, share, quotes, validations).
- [x] `/` redireciona por sessão (logado → `/dashboard`, senão → `/login`); galeria do Design System em `/design-system`.
- [x] Loading skeleton no segmento dashboard; dark mode via tokens + toggle pronto (`useTheme`).
- [x] `npm run check` + build verdes.

## 4. Decisões travadas na implementação

- Sem lib de charts: barras CSS com tokens `chart-*` (volume do MVP não justifica Recharts).
- KPIs por `created_at` no período (mês atual/anterior/90 dias); pendente é "agora" (status efetivo).
- Vitest 5 exigiu `@types/node` 24 (runtime local é Node 24); config em `vitest.config.mts`.
- `npm test` = `vitest run` (sem watch no CI local).
