import { redirect } from "next/navigation";
import { PageHeader } from "@/components/quotes/page-header";
import {
  SettingsForm,
  type SettingsInitial,
} from "@/components/settings/settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/configuracoes");

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("quote_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const initial: SettingsInitial = {
    name: profile?.name ?? "",
    company_name: profile?.company_name ?? "",
    phone: profile?.phone ?? "",
    logo_url: profile?.logo_url ?? "",
    validade_padrao_dias: settings?.validade_padrao_dias ?? 15,
    condicoes_padrao: settings?.condicoes_padrao ?? "",
    prefixo_numero: settings?.prefixo_numero ?? "",
  };

  return (
    <>
      <PageHeader
        title="Configurações"
        description={user.email ?? "Sua conta e identidade da empresa"}
      />
      <Card>
        <CardContent className="pt-6">
          <SettingsForm userId={user.id} initial={initial} />
        </CardContent>
      </Card>
    </>
  );
}
