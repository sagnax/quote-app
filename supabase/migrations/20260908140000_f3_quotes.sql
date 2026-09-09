-- F3: orçamentos (cabeçalho + seções/etapas + itens) isolados por usuário

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete restrict,
  numero text not null,
  titulo text not null,
  status text not null default 'rascunho'
    check (status in ('rascunho', 'pendente', 'aprovado', 'recusado', 'expirado')),
  validade_em date,
  prazo_execucao text,
  forma_pagamento text,
  desconto_tipo text not null default 'valor'
    check (desconto_tipo in ('valor', 'percentual')),
  desconto_valor numeric not null default 0 check (desconto_valor >= 0),
  subtotal numeric not null default 0 check (subtotal >= 0),
  total numeric not null default 0 check (total >= 0),
  observacoes text,
  condicoes text,
  public_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_user_numero_unique unique (user_id, numero)
);

create table public.quote_sections (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  titulo text not null,
  ordem integer not null default 0
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  section_id uuid references public.quote_sections (id) on delete cascade,
  descricao text not null,
  tipo text not null default 'servico'
    check (tipo in ('servico', 'material', 'outro')),
  qtd numeric not null default 1 check (qtd > 0),
  unidade text not null default 'un',
  preco_unit numeric not null default 0 check (preco_unit >= 0),
  ordem integer not null default 0
);

create index quotes_user_id_idx on public.quotes (user_id);
create index quotes_client_id_idx on public.quotes (client_id);
create index quotes_status_idx on public.quotes (user_id, status);
create index quote_sections_quote_idx on public.quote_sections (quote_id);
create index quote_items_quote_idx on public.quote_items (quote_id);

-- Numeração sequencial por usuário, atômica (lock da linha de settings).
-- Formato: {prefixo ou ano}-{seq 4 dígitos}, ex: 2026-0001.
create or replace function public.next_quote_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  seq integer;
  prefix text;
  year_part text := extract(year from now())::text;
begin
  select s.proximo_numero, s.prefixo_numero
    into seq, prefix
    from public.quote_settings s
    where s.user_id = auth.uid()
    for update;

  if not found then
    insert into public.quote_settings (user_id)
    values (auth.uid())
    returning proximo_numero, prefixo_numero into seq, prefix;
  end if;

  update public.quote_settings
    set proximo_numero = seq + 1, updated_at = now()
    where user_id = auth.uid();

  return coalesce(nullif(prefix, ''), year_part) || '-' || lpad(seq::text, 4, '0');
end;
$$;

grant execute on function public.next_quote_number() to authenticated;

-- RLS: dono vê/altera só o próprio; sections/items via EXISTS no pai.
alter table public.quotes enable row level security;
alter table public.quote_sections enable row level security;
alter table public.quote_items enable row level security;

create policy "Ler próprios orçamentos"
  on public.quotes for select
  using ((select auth.uid()) = user_id);

create policy "Criar orçamentos próprios"
  on public.quotes for insert
  with check ((select auth.uid()) = user_id);

create policy "Atualizar próprios orçamentos"
  on public.quotes for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Excluir próprios orçamentos"
  on public.quotes for delete
  using ((select auth.uid()) = user_id);

create policy "Ler seções dos próprios orçamentos"
  on public.quote_sections for select
  using (exists (
    select 1 from public.quotes q
    where q.id = quote_id and q.user_id = (select auth.uid())
  ));

create policy "Escrever seções dos próprios orçamentos"
  on public.quote_sections for all
  using (exists (
    select 1 from public.quotes q
    where q.id = quote_id and q.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.quotes q
    where q.id = quote_id and q.user_id = (select auth.uid())
  ));

create policy "Ler itens dos próprios orçamentos"
  on public.quote_items for select
  using (exists (
    select 1 from public.quotes q
    where q.id = quote_id and q.user_id = (select auth.uid())
  ));

create policy "Escrever itens dos próprios orçamentos"
  on public.quote_items for all
  using (exists (
    select 1 from public.quotes q
    where q.id = quote_id and q.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.quotes q
    where q.id = quote_id and q.user_id = (select auth.uid())
  ));
