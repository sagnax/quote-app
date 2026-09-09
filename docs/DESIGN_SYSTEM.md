# Design System — App de Orçamentos (D0)

> Fonte única de verdade visual. Toda tela nova DEVE usar estes tokens/componentes. Nada de hex hard-coded em telas.

## 1. Princípios

1. **Denso mas legível:** orçamentos têm muitas linhas; priorize tabelas compactas, totais sempre visíveis.
2. **Mobile-first:** técnico na obra aprova pelo celular. Ações primárias (Aprovar, PDF, WhatsApp) sempre alcançáveis com polegar.
3. **Print = produto:** o PDF é o entregável. Preview em tela e impressão usam a mesma hierarquia.
4. **Tokens > valores:** cor, raio, espaçamento e tipo vêm de `app/globals.css` (`@theme`). Componentes de tela só usam classes semânticas (`bg-primary`, `text-muted-foreground`, etc).
5. **shadcn/ui como base:** não reinventar Button/Input/Table. Estender apenas padrões de domínio em `components/quotes/`.

## 2. Stack visual

- Next.js App Router + Tailwind CSS v4 (`@import "tailwindcss"`)
- shadcn/ui estilo `radix-nova`, baseColor `neutral`, CSS variables on
- Ícones: `lucide-react`
- Lint/format: **Biome apenas** (`npm run lint` = `biome check`). Sem ESLint.
- Fontes: `Inter` (UI/texto) + `Geist Mono` (valores/números). Via `next/font/google`.

## 3. Tokens (implementados em `app/globals.css`)

### 3.1 Cores base (shadcn neutral, oklch)

| Token | Uso |
|---|---|
| `background` / `foreground` | fundo da página / texto principal |
| `card` / `card-foreground` | cards de resumo, cliente |
| `popover` / `popover-foreground` | dropdowns, selects |
| `primary` / `primary-foreground` | ação principal (Novo orçamento, Salvar) — placeholder neutro, trocar pela marca em `/configuracoes` |
| `secondary` / `secondary-foreground` | ações secundárias |
| `muted` / `muted-foreground` | fundos sutis, labels, placeholders |
| `accent` / `accent-foreground` | hover, destaque sutil |
| `destructive` | excluir, recusado |
| `border` / `input` / `ring` | bordas, inputs, foco |
| `chart-1..5` | gráficos do dashboard (fase 5) |
| `sidebar.*` | reservado, se houver sidebar futura |

Dark mode via classe `.dark` (não é prioridade no MVP, mas tokens já existem).

### 3.2 Cores de domínio (extensão em `@theme`)

```css
--color-success: verde aprovado
--color-warning: amarelo pendente
--color-info: azul informativo
```

Mapeamento de status (único lugar permitido para cor de status):

| Status | Badge variant | Cor semântica |
|---|---|---|
| `rascunho` | `secondary` | `muted` cinza |
| `pendente` | `outline` + dot warning | `warning` |
| `aprovado` | `default` | `success` |
| `recusado` | `destructive` | `destructive` |
| `expirado` | `secondary` | neutro escuro |

Regra: telas usam `<StatusBadge status={...} />`, nunca `<Badge>` direto com cor manual.

### 3.3 Tipografia

- `--font-sans: Inter` — títulos, corpo, tabelas
- `--font-mono: Geist Mono` — valores (`R$`), números de orçamento, códigos
- Escala: `xs (12) / sm (14) / base (16) / lg (18) / xl (20) / 2xl (24) / 3xl (30)` — usar classes Tailwind padrão.
- Dinheiro: sempre `<Money value={...} />` (`lib/format.ts` → `Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' })`), fonte mono, tabular-nums.

### 3.4 Espaçamento / Radius / Sombra

- Radius base `--radius: 0.625rem`. Derivados `sm/md/lg/xl/2xl/3xl/4xl` via `calc()` (já no `globals.css`).
- Container padrão: `mx-auto max-w-5xl px-4 sm:px-6`.
- Cards de orçamento: `rounded-lg border bg-card p-4 sm:p-6`.
- Tabelas: header `text-xs uppercase text-muted-foreground`, linhas `border-t`, valores à direita com `font-mono`.

### 3.5 Breakpoints

`sm:640 / md:768 / lg:1024`. Regra: tabela de itens vira lista de cards abaixo de `md` (fase 3). Preview PDF sempre `max-w-[210mm]` centralizado.

## 4. Componentes

### 4.1 Base shadcn (já instalados, usar direto)

`button, badge, card, input, label, select, dialog, table, tabs, dropdown-menu, textarea, separator, skeleton, sonner`

- `Button`: `default` = salvar/criar, `outline` = cancelar/voltar, `destructive` = excluir, `ghost` = ações em linha, `link` = navegação sutil.
- `Table`: para itens e listas. Nunca tabela HTML crua.
- `Dialog`: criar cliente rápido, confirmar exclusão, mudar status.
- `Select`: status, clientes, unidades (`un, h, m², m, kg, pct, vb`).
- `Sonner` (`<Toaster />` no layout): feedback de save/erro. Obrigatório.

Não instalados ainda (adicionar quando precisar): `form, calendar/popover (validade), checkbox, radio-group, switch, avatar, sheet, tooltip`.

### 4.2 Padrões de domínio (`components/quotes/`)

| Componente | Props | Regra |
|---|---|---|
| `StatusBadge` | `{ status: QuoteStatus }` | Único jeito de exibir status. Mapa centralizado. |
| `Money` | `{ value: number, className? }` | Formatação BRL, mono, `R$ 1.234,56`. |
| `EmptyState` | `{ icon, title, description, action }` | Listas vazias (clientes, orçamentos). |
| `PageHeader` | `{ title, description, actions }` | Topo de cada página do dashboard. |
| `ClientForm` | `{ initial?, submitLabel?, onSuccess? }` | Criar/editar cliente (F2); base do quick-create. |
| `ClientQuickCreate` | `{ trigger?, onCreated? }` | Dialog reutilizável de criação rápida (lista e F3). |
| `ItemTable` | `{ items, onChange }` | Grade editável de itens (qtd × unit = total ao vivo). |
| `TotalsPanel` | `{ subtotal, desconto*, total, save* }` | Painel sticky de valores com desconto editável + salvar. |
| `QuoteForm` | `{ mode, clients, quoteId?, initial?, defaults? }` | Form completo de orçamento (3 abas + painel). |
| `QuoteStatusActions` | `{ quote }` | Transições de status, duplicar e excluir. |
| `QuoteFilters` | `{ initialQuery, initialStatus }` | Busca + filtro de status da lista. |
| `QuoteDocument` | `{ doc: QuoteDocumentData }` | Documento do orçamento (tela, público e print A4). |
| `QuoteSharePanel` | `{ quoteId, token, numero, total, ... }` | Imprimir/PDF, WhatsApp, copiar e regenerar link. |
| `PrintButton` | `{ label? }` | Botão `window.print()` (área `.no-print`). |
| `DashboardFilters` | `{ period }` | Seletor de período do dashboard (mês/anterior/90d). |

## 9. Testes

- `npm test` (Vitest, `lib/**/*.test.ts`): cobre cálculos, formatação, share,
  status e schemas Zod. Lógica pura nova entra com teste.
| `TotalsPanel` (fase 3) | `{ subtotal, desconto, total }` | Sempre à direita/sticky no form. |
| `ItemTable` (fase 3) | `{ items, onChange }` | qtd × unit = total ao vivo. |

Tipos canônicos em `lib/quotes.ts`:

```ts
export type QuoteStatus = "rascunho" | "pendente" | "aprovado" | "recusado" | "expirado";
export type ItemType = "servico" | "material" | "outro";
```

### 4.3 Layout

- `app/layout.tsx`: `lang="pt-BR"`, fonts Inter + mono, `<Toaster />`, metadata `Quote App — Orçamentos`.
- Tema claro/escuro/sistema via `components/theme-provider.tsx` (`ThemeProvider` + `useTheme`, persiste em `localStorage`, classe `.dark` aplicada no mount). **Não usar `next-themes`** (incompatível com Next 16: renderiza `<script>` em Client Component) e **não usar `<script>` inline no layout** (o Next 16 também reclama na hidratação).
- `(dashboard)` futuro terá header com nome empresa + nav. D0: página `/` demonstra o sistema.
- Print: `@media print` esconde nav/botões (`.no-print`), mostra apenas `.print-area`. Margem `A4 12mm`.

## 5. Regras de uso (obrigatórias)

1. Importar UI via `@/components/ui/*`, domínio via `@/components/quotes/*`, utils via `@/lib/*` (`@/…` = raiz).
2. Proibido: `style={{ color: '#...' }}`, `bg-[#...]`, `text-red-500` direto para status. Usar token/variante.
3. Todo formulário usa `label` + `input` shadcn + mensagem de erro `text-sm text-destructive`.
4. Todo valor monetário usa `Money`. Toda data usa `lib/format.ts` (`formatDateBR`).
5. Novos componentes de domínio entram no catálogo abaixo + demo em `/`.
6. Antes de commit: `npm run lint` (Biome) + `npx tsc --noEmit` devem passar.

## 6. Catálogo D0 (entregue)

- [x] Tokens base + dark + radius em `globals.css`
- [x] Extensão domínio: `success/warning/info`, print CSS, `.tabular`
- [x] `lib/format.ts` (moeda/data), `lib/quotes.ts` (tipos + mapa status)
- [x] `StatusBadge`, `Money`, `EmptyState`, `PageHeader`
- [x] Galeria em `app/design-system/page.tsx` (tokens, botões, badges, tabela, totais, empty)
- [x] Biome sem ESLint, `npm run lint` verde

## 7. Próximos (fora do D0)

- F1: Auth + `/configuracoes` (trocar placeholder pela marca real: primary, logo).
- F3: `ItemTable`, `TotalsPanel`, máscaras de input.
- F4: template PDF A4 + `.print-area`.
- F5: charts com `chart-1..5`.

## 8. Como trocar a marca depois

1. Ajustar `--primary`, `--accent`, `--radius` em `:root` (+ `.dark`).
2. Subir logo em `/configuracoes` (Storage `logos`).
3. Nada em telas precisa mudar — tudo referencia tokens.
