import { redirect } from "next/navigation";
import { PageHeader } from "@/components/quotes/page-header";
import { QuoteForm } from "@/components/quotes/quote-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function defaultValidade(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export default async function NovoOrcamentoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/orcamentos/novo");

  const [{ data: clients }, { data: settings }] = await Promise.all([
    supabase.from("clients").select("id, nome").order("nome"),
    supabase
      .from("quote_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <>
      <PageHeader
        title="Novo orçamento"
        description="Cliente, itens e condições — o total é calculado sozinho."
      />
      <QuoteForm
        mode="create"
        clients={(clients ?? []) as { id: string; nome: string }[]}
        defaults={{
          validadeEm: defaultValidade(settings?.validade_padrao_dias ?? 15),
          condicoes: settings?.condicoes_padrao ?? "",
        }}
      />
    </>
  );
}
