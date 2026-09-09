<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Design System — uso obrigatório

Toda UI DEVE seguir `docs/DESIGN_SYSTEM.md` (fonte única de verdade). Regras inegociáveis:

1. Ler `docs/DESIGN_SYSTEM.md` antes de criar/alterar qualquer tela ou componente.
2. Usar apenas tokens semânticos de `app/globals.css` (`bg-primary`, `text-muted-foreground`, `bg-success`, etc). Proibido hex hard-coded, `style={{ color: ... }}`, `bg-[#...]` ou cor direta de status.
3. Usar shadcn/ui de `@/components/ui/*` e padrões de domínio de `@/components/quotes/*` (`StatusBadge`, `Money`, `EmptyState`, `PageHeader`). Status só via `<StatusBadge status={...} />`; dinheiro só via `<Money value={...} />`; datas via `lib/format.ts`.
4. Imports via alias `@/*`. Novos padrões de domínio entram em `components/quotes/` + catálogo no DESIGN_SYSTEM.md.
5. Lint/format apenas com Biome (`npm run lint`, `npm run check`). Sem ESLint.
6. Antes de finalizar: `npm run check` (biome + `tsc --noEmit`) deve passar.
7. Constantes/valores compartilhados vivem em `lib/` (sem `"use client"`). Proibido importar valor (não-componente) de arquivo `"use client"` em Server Component — chega `undefined` no SSR sem erro de build.
