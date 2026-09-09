import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calcItemTotal } from "@/lib/calculations";
import { formatBRL } from "@/lib/format";
import { ITEM_TYPE_LABEL, type ItemType, UNIT_OPTIONS } from "@/lib/quotes";

export type ItemDraft = {
  key: string;
  descricao: string;
  tipo: ItemType;
  qtd: number;
  unidade: string;
  preco_unit: number;
};

export function newItemDraft(): ItemDraft {
  return {
    key: crypto.randomUUID(),
    descricao: "",
    tipo: "servico",
    qtd: 1,
    unidade: "un",
    preco_unit: 0,
  };
}

/** Tabela editável de um grupo de itens (gerais ou de uma etapa). */
export function ItemTable({
  items,
  onChange,
}: {
  items: ItemDraft[];
  onChange: (items: ItemDraft[]) => void;
}) {
  function patch(key: string, field: keyof ItemDraft, value: string | number) {
    onChange(
      items.map((it) => (it.key === key ? { ...it, [field]: value } : it)),
    );
  }

  function remove(key: string) {
    onChange(items.filter((it) => it.key !== key));
  }

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-40">Descrição</TableHead>
            <TableHead className="w-28">Tipo</TableHead>
            <TableHead className="w-20 text-right">Qtd</TableHead>
            <TableHead className="w-20">Un</TableHead>
            <TableHead className="w-28 text-right">Preço unit.</TableHead>
            <TableHead className="w-28 text-right">Total</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.key}>
              <TableCell>
                <Input
                  aria-label={`Descrição do item ${idx + 1}`}
                  placeholder="Ex: Mão de obra — pintura"
                  value={item.descricao}
                  onChange={(e) => patch(item.key, "descricao", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={item.tipo}
                  onValueChange={(v) => patch(item.key, "tipo", v as ItemType)}
                >
                  <SelectTrigger aria-label={`Tipo do item ${idx + 1}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ITEM_TYPE_LABEL) as ItemType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {ITEM_TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  aria-label={`Quantidade do item ${idx + 1}`}
                  type="number"
                  min={0}
                  step="any"
                  className="text-right font-mono tabular"
                  value={item.qtd}
                  onChange={(e) =>
                    patch(item.key, "qtd", e.target.valueAsNumber || 0)
                  }
                />
              </TableCell>
              <TableCell>
                <Select
                  value={item.unidade}
                  onValueChange={(v) => patch(item.key, "unidade", v)}
                >
                  <SelectTrigger aria-label={`Unidade do item ${idx + 1}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  aria-label={`Preço unitário do item ${idx + 1}`}
                  type="number"
                  min={0}
                  step="any"
                  className="text-right font-mono tabular"
                  value={item.preco_unit}
                  onChange={(e) =>
                    patch(item.key, "preco_unit", e.target.valueAsNumber || 0)
                  }
                />
              </TableCell>
              <TableCell className="text-right font-mono tabular text-sm">
                {formatBRL(calcItemTotal(item.qtd, item.preco_unit))}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover item ${idx + 1}`}
                  onClick={() => remove(item.key)}
                >
                  <Trash2 aria-hidden />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, newItemDraft()])}
        >
          <Plus aria-hidden />
          Adicionar item
        </Button>
      </div>
    </div>
  );
}
