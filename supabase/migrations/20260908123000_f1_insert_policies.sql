-- F1 follow-up: permite upsert resiliente do app (o trigger já cria as linhas
-- no cadastro; esta policy cobre contas criadas antes da migration F1).

create policy "Criar próprio profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

create policy "Criar próprias settings"
  on public.quote_settings for insert
  with check ((select auth.uid()) = user_id);
