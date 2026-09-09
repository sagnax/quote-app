# PRD F3 — Orçamentos Core (CRUD + Itens + Status)

Status: **concluído e verificado end-to-end contra Supabase local**.

## 1. Objetivo

Criar, editar, duplicar e gerenciar orçamentos com itens/serviços/materiais organizados em etapas, cálculo automático e máquina de status.

## 2. Escopo

Inclui:
- Tabelas: `quotes` (id, user_id, client_id, numero `2026-0001`, titulo, status, validade_em, prazo_execucao, forma_pagamento, desconto_tipo valor|percentual, desconto_valor, subtotal, total, observacoes, condicoes, public_token, created_at) + `quote_sections` (id, quote_id, titulo, ordem) + `quote_items` (id, quote_id, section_id nullable, descricao, tipo servico|material|outro, qtd, unidade, preco_unit, ordem). Totais persistidos mas sempre recalculados/validados no server.
- Numeração automática sequencial por usuário via `quote_settings.proximo_numero` (transação; formato `{ano}-{seq:04d}`).
- Telas: `/orcamentos` (lista com filtro por status + busca + cliente) e `/orcamentos/novo` + `/orcamentos/[id]` (form em passos: Cliente → Itens/Etapas → Valores → Condições + preview).
- Componentes: `ItemTable` (qtd × unit = total ao vivo), `TotalsPanel` (subtotal/desconto/total sticky).
- Status machine: `rascunho → pendente → aprovado/recusado`; `expirado` automático quando `validade_em < hoje` (job ou cálculo na leitura + badge). Transições via ação explícita com confirmação.
- Ações: duplicar (novo numero, status rascunho), excluir (confirmação), mudar status.
- Cálculos em `lib/calculations.ts` (já existe; estender se preciso).

Fora do escopo: PDF/WhatsApp/link público (F4), financeiro/pagamentos, drag-and-drop de ordenação (pós-MVP, usar botões ↑↓).

## 3. Requisitos funcionais

- RF1: criar orçamento exige cliente + ≥1 item com descricao/qtd/preco válidos.
- RF2: seções/etapas opcionais (ex: "Etapa 1 — Fundação"); itens sem seção permitidos.
- RF3: desconto `valor` ou `percentual`; total nunca negativo (floora em 0).
- RF4: número único por usuário; concorrência não duplica número.
- RF5: lista filtra por status/busca; cada linha mostra numero, cliente, total (`Money`), validade e `StatusBadge`.
- RF6: duplicar copia seções/itens/condições com novo número e `public_token` novo.

## 4. Critérios de aceite

- [x] Fluxo completo: criar → pendente → aprovado, com totais corretos (18 checks E2E via API + 9 de lógica).
- [x] Orçamento vencido exibe `expirado` (status efetivo calculado) e bloqueia aprovação sem renovar validade.
- [x] RLS: isolamento por usuário em quotes/sections/items (leitura, escrita e transições).
- [x] Numeração atômica via RPC `next_quote_number()` (`2026-0001`, sequencial por usuário, retry em corrida 23505).
- [x] Duplicar gera novo número + rascunho; excluir apaga em cascata; sem sessão → 307 login.
- [x] Responsivo: form em grid com `TotalsPanel` sticky no desktop.
- [x] `npm run check` + build verdes.

## 5. Decisões travadas na implementação

- Form em 3 abas (Cliente / Itens / Condições) + painel Valores sempre visível e
  sticky, em vez de 4 passos — mesma cobertura com menos cliques.
- Status `expirado` é **calculado** (`effectiveStatus`), nunca gravado; aprovado/recusado
  não expiram; transições extras só `pendente → rascunho` (voltar).
- Edição regrava seções/itens (delete + insert) em vez de diff por linha.
- Busca por nome do cliente filtra em memória (volume do MVP); número/título via ilike.
- Excluir cliente com orçamentos é bloqueado com mensagem (RESTRICT + pré-checagem).
