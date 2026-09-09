# PRD F0 — Setup + Design System (D0)

Status: **concluído**.

## 1. Objetivo

Criar a fundação técnica e visual do app para que todas as fases seguintes construam sobre tokens e componentes padronizados.

## 2. Escopo

Inclui:
- Scaffold Next.js 16 (App Router) + TypeScript + Tailwind v4, sem ESLint.
- Biome como única ferramenta de lint/format (`npm run lint`, `npm run check`).
- shadcn/ui estilo `radix-nova`, baseColor `neutral`, CSS variables.
- `docs/DESIGN_SYSTEM.md` como fonte única de verdade.
- Tokens de domínio (`success/warning/info`), tipografia (Inter + Geist Mono), print CSS A4.
- Componentes de domínio: `StatusBadge`, `Money`, `EmptyState`, `PageHeader`.
- Libs: `lib/format.ts`, `lib/quotes.ts`, `lib/calculations.ts`.
- Página demo em `/` exercitando o sistema.
- Regra obrigatória de uso do Design System em `AGENTS.md`.

Fora do escopo: qualquer regra de negócio (auth, CRUD, banco).

## 3. Requisitos

- RF1: `npm run check` (biome + `tsc --noEmit`) passa.
- RF2: `npm run build` gera rota `/` estática sem erro.
- RF3: Demo exibe todos os 5 status via `StatusBadge`, tabela de itens e totais via `Money`.
- RF4: Nenhum hex hard-coded nas telas; só tokens semânticos.

## 4. Critérios de aceite

- [x] Scaffold + Biome + shadcn instalados.
- [x] `docs/DESIGN_SYSTEM.md` criado.
- [x] `globals.css` com tokens de domínio + print.
- [x] Layout pt-BR + Toaster.
- [x] Build + check verdes.
- [x] Cálculos conferidos por execução (subtotal 3969.40 → 3770.93 com 5%).
