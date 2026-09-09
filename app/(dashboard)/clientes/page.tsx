import { Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientQuickCreate } from "@/components/clientes/client-quick-create";
import { ClientSearch } from "@/components/clientes/client-search";
import { DeleteClientButton } from "@/components/clientes/delete-client-button";
import { EmptyState } from "@/components/quotes/empty-state";
import { PageHeader } from "@/components/quotes/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateBR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { CLIENT_TIPO_LABEL, type Client } from "@/lib/validations/client";

export const dynamic = "force-dynamic";

function escapeIlike(value: string) {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/clientes");

  let db = supabase
    .from("clients")
    .select("*")
    .order("nome", { ascending: true });

  if (query) {
    const pattern = `%${escapeIlike(query)}%`;
    db = db.or(
      `nome.ilike.${pattern},email.ilike.${pattern},telefone.ilike.${pattern}`,
    );
  }

  const { data, error } = await db;
  const clients = (data ?? []) as Client[];

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cadastre PF e PJ para vincular aos orçamentos."
        actions={<ClientQuickCreate />}
      />
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
          Não foi possível carregar os clientes: {error.message}
        </p>
      ) : null}
      <div className="no-print">
        <ClientSearch initialQuery={query} />
      </div>
      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          description={
            query
              ? `Sem resultados para "${query}". Tente outro termo.`
              : "Cadastre o primeiro cliente para vincular aos orçamentos."
          }
          action={!query ? <ClientQuickCreate /> : undefined}
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/clientes/${client.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {client.nome}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {CLIENT_TIPO_LABEL[client.tipo]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {[client.email, client.telefone]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateBR(client.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="no-print flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/clientes/${client.id}`}>Editar</Link>
                        </Button>
                        <DeleteClientButton
                          clientId={client.id}
                          clientName={client.nome}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
