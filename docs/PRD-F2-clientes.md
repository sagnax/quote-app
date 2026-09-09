# PRD F2 — Clientes (CRUD)

Status: **concluído e verificado end-to-end contra Supabase local**.

## 1. Objetivo

Cadastrar e gerenciar clientes (PF/PJ) para vinculá-los aos orçamentos.

## 2. Escopo

Inclui:
- Tabela `clients` (id, user_id, nome, tipo pf/pj, cpf_cnpj, email, telefone, endereco, observacoes, created_at) com RLS por `user_id`.
- Telas: `/clientes` (lista + busca + EmptyState) e detalhe/edição (página ou Dialog).
- Criação rápida de cliente dentro do fluxo de orçamento (Dialog reutilizável).
- Validação Zod (nome obrigatório; e-mail/telefone/cpf_cnpj opcionais com formato básico).

Fora do escopo: histórico financeiro, importação CSV (fase 2+).

## 3. Requisitos funcionais

- RF1: listar clientes do usuário com busca por nome/e-mail/telefone.
- RF2: criar/editar/excluir (exclusão com confirmação; bloqueia se houver orçamentos vinculados — ou pergunta se desvincula; decisão na implementação: bloquear com mensagem).
- RF3: `ClienteQuickCreate` (Dialog) reutilizável pelo F3.
- RF4: página do cliente mostra seus orçamentos (lista simples, link para F3).

## 4. Critérios de aceite

- [x] CRUD completo com RLS (usuário isolado) — 13 checks E2E via API.
- [x] Busca funciona (`?q=` com ilike em nome/e-mail/telefone, sem vazar entre usuários); lista vazia mostra `EmptyState` com CTA.
- [x] Validação impede salvar sem nome (Zod + NOT NULL); erros visíveis no form.
- [x] `ClienteQuickCreate` (Dialog) reutilizável pronto para o F3.
- [x] Exclusão com confirmação; sem sessão `/clientes` → 307 para login.
- [x] `npm run check` + build verdes.

## 5. Decisões travadas na implementação

- Insert exige `user_id` explícito (coluna NOT NULL sem default + policy WITH CHECK);
  o `ClientForm` obtém via `supabase.auth.getUser()` e o E2E cobre spoof de `user_id`.
- Detalhe em `/clientes/[id]` (edição + seção de orçamentos com `EmptyState`
  até o F3 criar as tabelas); sem modal de edição para manter 1 fluxo de form.
- Nav do dashboard: Clientes | Configurações no header.
