# PRD F4 — Link Público + PDF + WhatsApp

Status: **concluído e verificado end-to-end contra Supabase local**.

## 1. Objetivo

Permitir que o cliente final veja o orçamento sem login, baixe o PDF e receba tudo pelo WhatsApp. O PDF é o entregável.

## 2. Escopo

Inclui:
- `quotes.public_token` (uuid, gerado na criação, regenerável) + policy pública de leitura: só via token **e** com `validade_em >= hoje` (decisão travada: link expira junto com a validade).
- Rota pública `/q/[token]`: somente leitura (empresa, cliente, itens por seção, totais, validade, condições). Se expirado/revogado → estado "Orçamento expirado, solicite atualização" (HTTP 410 conceitual, página amigável, sem vazar dados além do básico).
- Preview `/orcamentos/[id]/preview`: layout print-friendly (`.print-area`, `.no-print` nos botões) + botão Imprimir/PDF (`window.print`) e Download.
- PDF pixel-perfect só se o print não bastar: `@react-pdf/renderer` ou rota `/api/quotes/[id]/pdf` (adiar decisão; começar com print).
- Share WhatsApp: botão monta texto (`Olá {cliente}, segue orçamento {numero} de {total} válido até {data}. {link}`) + `https://wa.me/?text=...` (+ telefone do cliente se houver). Anexo do PDF é manual no MVP (informar no botão/tooltip).
- Botão "regenerar link" (invalida o anterior) e "copiar link".

Fora do escopo: assinatura digital, aceite online pelo link (fase 2+), envio automático via API do WhatsApp.

## 3. Requisitos funcionais

- RF1: acesso público não exige login e não expõe outros orçamentos/dados do dono.
- RF2 (decisão travada): expirado → página com nome da empresa + número + aviso
  "solicite atualização", **ocultando itens, totais e condições**.
- RF3: impressão A4 com margens 12mm, sem nav/botões (`.no-print` / `.print-area`).
- RF4: mensagem WhatsApp usa formatação BRL e data pt-BR via `lib/format.ts`.

## 4. Critérios de aceite

- [x] Link válido abre sem login (200); link inválido → 404; expirado → estado expirado sem valores.
- [x] Regenerar link invalida o antigo (novo `public_token`).
- [x] Impressão usa o mesmo `QuoteDocument` da tela (A4, sem botões).
- [x] Compartilhar no WhatsApp abre `wa.me` com texto correto (8 testes unit + normalização DDI 55).
- [x] RPC `get_public_quote` não vaza `user_id`, contatos do cliente nem observações internas (17 checks E2E).
- [x] `npm run check` + build verdes.

## 5. Decisões travadas na implementação

- Acesso público via RPC `SECURITY DEFINER` (token = credencial), sem policies para `anon`.
- PDF do MVP = impressão do navegador (sem `@react-pdf`); anexo ao WhatsApp é manual.
- `observacoes` é interno (não aparece no público nem no documento); `condicoes` é público.
- Preview do dono (`/orcamentos/[id]/preview`) e página pública usam o mesmo
  `QuoteDocument`; seção de orçamentos adicionada à página do cliente (RF4 do F2).
