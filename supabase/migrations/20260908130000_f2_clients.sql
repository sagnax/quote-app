-- F2: cadastro de clientes (PF/PJ) isolado por usuário

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  tipo text not null default 'pf' check (tipo in ('pf', 'pj')),
  cpf_cnpj text,
  email text,
  telefone text,
  endereco text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_user_id_idx on public.clients (user_id);
create index clients_nome_idx on public.clients (user_id, nome);

alter table public.clients enable row level security;

create policy "Ler próprios clientes"
  on public.clients for select
  using ((select auth.uid()) = user_id);

create policy "Criar clientes próprios"
  on public.clients for insert
  with check ((select auth.uid()) = user_id);

create policy "Atualizar próprios clientes"
  on public.clients for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Excluir próprios clientes"
  on public.clients for delete
  using ((select auth.uid()) = user_id);
