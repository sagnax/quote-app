# Quote App — Orçamentos profissionais

App web para criar orçamentos com etapas e materiais, gerenciar clientes e status,
gerar PDF e compartilhar via link público ou WhatsApp. Inclui dashboard com KPIs
e testes automatizados.

Stack: **Next.js 16 + TypeScript + Tailwind + shadcn/ui + Biome + Supabase local (Docker) + Vitest.**

## Rodando localmente

Pré-requisitos: Node 20+, Docker Desktop em execução.

```bash
npm install

# Sobe Postgres + Auth + Storage locais (portas 55021–55024, ver supabase/config.toml)
npx supabase start

# Configure o acesso ao Supabase local
cp .env.example .env.local
# .env.local já traz os valores padrão do `supabase start`;
# confira com `npx supabase status`

npm run dev
```

Abra http://localhost:3000, crie a conta e entre. E-mails de teste (magic link,
recuperação) aparecem no Mailpit: http://127.0.0.1:55024. Studio (banco):
http://127.0.0.1:55023.

## Scripts

| Comando        | O quê                                    |
| -------------- | ---------------------------------------- |
| `npm run dev`  | Servidor de desenvolvimento (porta 3000) |
| `npm run build`| Build de produção                        |
| `npm run check`| Biome + `tsc --noEmit` (deve passar)    |
| `npm test`     | Vitest (39 testes de libs)               |

## Regras do projeto

- UI segue `docs/DESIGN_SYSTEM.md` (obrigatório, ver `AGENTS.md`).
- PRDs por fase em `docs/PRD-F*.md`.
- Sem ESLint — lint/format só com Biome.
