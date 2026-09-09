-- F4: leitura pública de orçamento via token (sem login).
-- O token é a credencial: quem tem o link vê. Expira junto com a validade
-- (rascunho/pendente vencido retorna só cabeçalho + aviso, sem valores).
-- observacoes NÃO é exposto (interno); condicoes é público.

create or replace function public.get_public_quote(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.quotes%rowtype;
  v_company jsonb;
  v_expired boolean;
begin
  select * into q from public.quotes where public_token = p_token;

  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  select jsonb_build_object(
    'name', p.company_name,
    'phone', p.phone,
    'logo_url', p.logo_url
  ) into v_company
  from public.profiles p where p.id = q.user_id;

  v_expired := q.validade_em is not null
    and q.validade_em < current_date
    and q.status in ('rascunho', 'pendente');

  if v_expired then
    return jsonb_build_object(
      'status', 'expired',
      'numero', q.numero,
      'company', v_company
    );
  end if;

  return jsonb_build_object(
    'status', 'ok',
    'numero', q.numero,
    'titulo', q.titulo,
    'quote_status', q.status,
    'validade_em', q.validade_em,
    'prazo_execucao', q.prazo_execucao,
    'forma_pagamento', q.forma_pagamento,
    'desconto_tipo', q.desconto_tipo,
    'desconto_valor', q.desconto_valor,
    'subtotal', q.subtotal,
    'total', q.total,
    'condicoes', q.condicoes,
    'company', v_company,
    'client', (
      select jsonb_build_object('nome', c.nome)
      from public.clients c where c.id = q.client_id
    ),
    'sections', coalesce((
      select jsonb_agg(jsonb_build_object(
        'titulo', s.titulo,
        'items', coalesce((
          select jsonb_agg(jsonb_build_object(
            'descricao', i.descricao,
            'tipo', i.tipo,
            'qtd', i.qtd,
            'unidade', i.unidade,
            'preco_unit', i.preco_unit
          ) order by i.ordem)
          from public.quote_items i where i.section_id = s.id
        ), '[]'::jsonb)
      ) order by s.ordem)
      from public.quote_sections s where s.quote_id = q.id
    ), '[]'::jsonb),
    'loose_items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'descricao', i.descricao,
        'tipo', i.tipo,
        'qtd', i.qtd,
        'unidade', i.unidade,
        'preco_unit', i.preco_unit
      ) order by i.ordem)
      from public.quote_items i where i.quote_id = q.id and i.section_id is null
    ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.get_public_quote(uuid) to anon, authenticated;
