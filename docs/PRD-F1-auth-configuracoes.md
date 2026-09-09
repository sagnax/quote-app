# PRD F1 — Auth + Configurações da Empresa

Status: **concluído e verificado end-to-end contra Supabase local**.

## 1. Objetivo

Cada usuário tem conta própria, acessa apenas seus dados e configura a identidade da empresa (nome, logo placeholder, condições padrão) usada nos orçamentos e no PDF.

## 2. Escopo

Inclui:
- Projeto Supabase (Postgres + Auth + Storage) + variáveis `.env.local`.
- Supabase Auth e-mail/senha (+ link mágico opcional) e recuperação de senha.
- Middleware Next.js protegendo rotas `(dashboard)`; redireciono para `/login` se sem sessão.
- Telas: `/login`, `/cadastro`, `/recuperar-senha`.
- Tabelas: `profiles` (id FK auth.users, name, company_name, phone, logo_url) e `quote_settings` (user_id PK, condicoes_padrao, validade_padrao_dias, prefixo_numero, proximo_numero).
- Bucket Storage `logos` (upload de logo, leitura pública só do próprio usuário via RLS/policy).
- Tela `/configuracoes`: dados da empresa, upload de logo, validade padrão (dias), condições padrão de pagamento/execução.
- RLS: `auth.uid() = user_id` em todas as tabelas privadas.

Fora do escopo: CRUD de clientes/orçamentos (F2/F3), multi-empresa, papéis (admin/user).

## 3. Requisitos funcionais

- RF1: cadastro cria `auth.user` + linha em `profiles` + `quote_settings` com `proximo_numero = 1`.
- RF2: login mantém sessão SSR (cookies Supabase) e protege `/configuracoes`.
- RF3: upload de logo aceita PNG/JPG ≤ 2MB, salva em `logos/{user_id}/logo.*`, atualiza `profiles.logo_url`.
- RF4: troca de marca = só tokens + logo; nenhuma tela precisa de alteração (validar trocando `--primary`).

## 4. Requisitos não-funcionais

- RNF1: formulários com React Hook Form + Zod + mensagens de erro `text-destructive`.
- RNF2: feedback via `Sonner` (sucesso/erro).
- RNF3: seguir `docs/DESIGN_SYSTEM.md` (PageHeader, Card, Input/Label, Buttons).
- RNF4: Next 16 usa convenção `proxy.ts` (não `middleware.ts`) para sessão/redirects.

## 5. Decisões travadas na implementação

- Supabase **local via Docker** (`supabase start`); portas remapeadas 5432x → 5502x
  (faixa 54149–54548 reservada pelo Windows): API 55021, DB 55022, Studio 55023,
  Mailpit 55024. Ver `supabase/config.toml`.
- Auth **ambos**: senha + magic link. Callback único `/auth/callback` (página cliente)
  trata `?code=` (PKCE) e `#access_token` (fragmento).
- `site_url=http://localhost:3000` + `additional_redirect_urls` com `/**` para
  `localhost` e `127.0.0.1` — sem isso o GoTrue descarta o path de `emailRedirectTo`.
- Bucket `logos` **público**, caminho `logos/{user_id}/logo.{png,jpg}`.
- Chaves novas do CLI (`sb_publishable_*`) via `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
  leitura centralizada em `lib/supabase/env.ts` (sem non-null assertions).

## 6. Critérios de aceite

- [x] Cadastro → login → acesso a `/configuracoes` sem erro.
- [x] Usuário A não lê nem altera dados do usuário B (12 checks E2E via API: trigger, RLS leitura/escrita, storage).
- [x] Upload de logo aparece no header/preview (upload própria pasta OK, pasta alheia bloqueada, URL pública válida).
- [x] Magic link chega no Mailpit e o clique (303) leva a `/auth/callback?next=...` com `access_token` válido.
- [x] `/configuracoes` sem sessão → 307 para `/login?next=/configuracoes`.
- [x] `npm run check` + build verdes.
