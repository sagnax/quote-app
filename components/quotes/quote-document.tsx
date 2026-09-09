import Image from "next/image";
import { Money } from "@/components/quotes/money";
import { StatusBadge } from "@/components/quotes/status-badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatDateBR } from "@/lib/format";
import type { PublicItem, PublicSection } from "@/lib/public-quote";
import { ITEM_TYPE_LABEL, type QuoteStatus } from "@/lib/quotes";

export type QuoteDocumentData = {
  companyName: string | null;
  companyPhone: string | null;
  logoUrl: string | null;
  numero: string;
  titulo: string;
  status: QuoteStatus;
  validadeEm: string | null;
  prazoExecucao: string | null;
  formaPagamento: string | null;
  condicoes: string | null;
  descontoTipo: "valor" | "percentual";
  descontoValor: number;
  subtotal: number;
  total: number;
  clientName: string;
  sections: { titulo: string; items: PublicItem[] }[];
  looseItems: PublicItem[];
};

/** Documento do orçamento: mesma hierarquia na tela, no público e no print. */
export function QuoteDocument({ doc }: { doc: QuoteDocumentData }) {
  const allSections: PublicSection[] = [
    ...doc.sections,
    ...(doc.looseItems.length > 0
      ? [{ titulo: "Itens", items: doc.looseItems }]
      : []),
  ];

  return (
    <div className="print-area">
      <Card>
        <CardContent className="flex flex-col gap-5 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {doc.logoUrl ? (
                <Image
                  src={doc.logoUrl}
                  alt={`Logo de ${doc.companyName ?? "empresa"}`}
                  width={56}
                  height={56}
                  unoptimized
                  className="size-14 rounded-lg border bg-muted object-contain"
                />
              ) : null}
              <div>
                <p className="font-semibold text-lg leading-tight">
                  {doc.companyName ?? "Orçamento"}
                </p>
                {doc.companyPhone ? (
                  <p className="text-muted-foreground text-sm">
                    {doc.companyPhone}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono tabular text-sm text-muted-foreground">
                {doc.numero}
              </p>
              <StatusBadge status={doc.status} />
            </div>
          </div>

          <div>
            <h1 className="font-semibold text-xl tracking-tight">
              {doc.titulo}
            </h1>
            <p className="text-muted-foreground text-sm">
              Cliente: <span className="text-foreground">{doc.clientName}</span>
            </p>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-xs uppercase">
                Válido até
              </p>
              <p>
                {doc.validadeEm
                  ? formatDateBR(`${doc.validadeEm}T00:00:00`)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">
                Prazo de execução
              </p>
              <p>{doc.prazoExecucao || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">
                Pagamento
              </p>
              <p>{doc.formaPagamento || "—"}</p>
            </div>
          </div>

          <Separator />

          {allSections.map((section) => (
            <div key={section.titulo} className="flex flex-col gap-2">
              <h2 className="font-medium text-sm">{section.titulo}</h2>
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
                  {section.items.map((item) => (
                    <TableRow key={`${item.descricao}-${item.unidade}`}>
                      <TableCell className="whitespace-normal">
                        {item.descricao}
                        <span className="block text-muted-foreground text-xs">
                          {ITEM_TYPE_LABEL[
                            item.tipo as keyof typeof ITEM_TYPE_LABEL
                          ] ?? item.tipo}{" "}
                          · {item.unidade}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular">
                        {String(item.qtd)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Money value={Number(item.preco_unit)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Money
                          value={Number(item.qtd) * Number(item.preco_unit)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}

          <Table>
            <TableFooter>
              <TableRow>
                <TableCell>Subtotal</TableCell>
                <TableCell className="text-right">
                  <Money value={doc.subtotal} />
                </TableCell>
              </TableRow>
              {doc.descontoValor > 0 ? (
                <TableRow>
                  <TableCell>
                    Desconto{doc.descontoTipo === "percentual" ? " (%)" : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <Money
                      value={
                        doc.descontoTipo === "percentual"
                          ? (doc.subtotal * doc.descontoValor) / 100
                          : doc.descontoValor
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : null}
              <TableRow>
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-right">
                  <Money
                    value={doc.total}
                    className="font-semibold text-base"
                  />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {doc.condicoes ? (
            <div>
              <h2 className="font-medium text-sm">Condições</h2>
              <p className="whitespace-pre-line text-muted-foreground text-sm">
                {doc.condicoes}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
