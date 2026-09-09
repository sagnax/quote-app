import { FileText } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DeleteClientButton } from "@/components/clientes/delete-client-button";
import { EditClientForm } from "@/components/clientes/edit-client-form";
import { EmptyState } from "@/components/quotes/empty-state";
import { Money } from "@/components/quotes/money";
import { PageHeader } from "@/components/quotes/page-header";
import { StatusBadge } from "@/components/quotes/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateBR } from "@/lib/format";
import { effectiveStatus, type QuoteStatus } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/server";
import { CLIENT_TIPO_LABEL, type Client } from "@/lib/validations/client";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/clientes/${id}`);

  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const client = data as Client;

  const { data: quoteRows } = await supabase
    .from("quotes")
    .select("id, numero, titulo, status, validade_em, total")
    .eq("client_id", id)
    .order("created_at", { ascending: false });
  const quotes = (quoteRows ?? []) as {
    id: string;
    numero: string;
    titulo: string;
    status: QuoteStatus;
    validade_em: string | null;
    total: number | string;
  }[];

  return (
    <>
      <PageHeader
        title={client.nome}
        description={`${CLIENT_TIPO_LABEL[client.tipo]} · cliente desde ${formatDateBR(client.created_at)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/clientes">Voltar</Link>
            </Button>
            <DeleteClientButton clientId={client.id} clientName={client.nome} />
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <EditClientForm client={client} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum orçamento ainda"
              description="Os orçamentos deste cliente aparecerão aqui."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono tabular">
                      <Link
                        href={`/orcamentos/${quote.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {quote.numero}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {quote.titulo}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={effectiveStatus(
                          quote.status,
                          quote.validade_em,
                        )}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Money value={Number(quote.total)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
