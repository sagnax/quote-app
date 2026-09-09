import { FileText, Plus } from "lucide-react";
import { EmptyState } from "@/components/quotes/empty-state";
import { Money } from "@/components/quotes/money";
import { PageHeader } from "@/components/quotes/page-header";
import { StatusBadge } from "@/components/quotes/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calcSubtotal, calcTotal } from "@/lib/calculations";
import { QUOTE_STATUSES } from "@/lib/quotes";

const DEMO_ITEMS = [
  {
    descricao: "Mão de obra — pintura 2 demãos",
    qtd: 45,
    unidade: "m²",
    precoUnit: 38,
  },
  {
    descricao: "Tinta acrílica premium",
    qtd: 6,
    unidade: "un",
    precoUnit: 289.9,
  },
  {
    descricao: "Reparo em gesso / lixamento",
    qtd: 8,
    unidade: "h",
    precoUnit: 65,
  },
];

export default function DesignSystemDemo() {
  const subtotal = calcSubtotal(
    DEMO_ITEMS.map((i) => ({ qtd: i.qtd, precoUnit: i.precoUnit })),
  );
  const total = calcTotal(subtotal, "percentual", 5);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <PageHeader
        title="Design System — D0"
        description="Tokens, componentes base e padrões de orçamento. Veja docs/DESIGN_SYSTEM.md"
        actions={
          <>
            <Button variant="outline">Ver docs</Button>
            <Button>
              <Plus aria-hidden />
              Novo orçamento
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Orçamento demo 2026-0001</CardTitle>
          <CardDescription>
            Reforma sala comercial — cliente Acme Ltda · validade 15 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {QUOTE_STATUSES.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <Separator />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_ITEMS.map((item) => (
                <TableRow key={item.descricao}>
                  <TableCell className="whitespace-normal">
                    {item.descricao}
                    <span className="block text-muted-foreground text-xs">
                      {item.unidade}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular">
                    {item.qtd}
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={item.precoUnit} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Money value={item.qtd * item.precoUnit} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Subtotal</TableCell>
                <TableCell className="text-right">
                  <Money value={subtotal} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3}>Total com 5% desconto</TableCell>
                <TableCell className="text-right">
                  <Money value={total} className="font-semibold text-base" />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Form base</CardTitle>
            <CardDescription>Input + Label com tokens</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="cliente">Cliente</Label>
              <Input id="cliente" placeholder="Ex: Maria Silva" />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">Secundário</Button>
              <Button variant="destructive">Excluir</Button>
              <Button variant="ghost">Fantasma</Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Cores de domínio:{" "}
              <span className="font-medium text-success">aprovado</span> ·{" "}
              <span className="font-medium text-warning">pendente</span> ·{" "}
              <span className="font-medium text-info">info</span>
            </p>
          </CardContent>
        </Card>

        <EmptyState
          icon={FileText}
          title="Nenhum orçamento ainda"
          description="Crie o primeiro orçamento para ver o cálculo automático, PDF e link de WhatsApp aqui."
          action={
            <Button size="sm">
              <Plus aria-hidden />
              Criar orçamento
            </Button>
          }
        />
      </div>
    </div>
  );
}
