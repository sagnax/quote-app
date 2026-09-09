-- F1: profiles + quote_settings + trigger de novo usuário + RLS + bucket logos (público)

-- Perfil da conta/empresa (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  company_name text,
  phone text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Preferências de numeração e padrões do orçamento
create table public.quote_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  condicoes_padrao text not null default '',
  validade_padrao_dias integer not null default 15,
  prefixo_numero text not null default '',
  proximo_numero integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cria profile + settings automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', null));
  insert into public.quote_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: cada usuário vê e altera só as próprias linhas
alter table public.profiles enable row level security;
alter table public.quote_settings enable row level security;

create policy "Ler próprio profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Atualizar próprio profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Ler próprias settings"
  on public.quote_settings for select
  using ((select auth.uid()) = user_id);

create policy "Atualizar próprias settings"
  on public.quote_settings for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Bucket público para logos (logo da empresa não é dado sensível;
-- caminho inclui o user_id: logos/{user_id}/logo.ext)
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do update set public = true;

create policy "Leitura pública de logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Upload de logo na própria pasta"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Atualizar logo na própria pasta"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Excluir logo na própria pasta"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
