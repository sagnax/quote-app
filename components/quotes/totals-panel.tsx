import { Money } from "@/components/quotes/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { DiscountType } from "@/lib/calculations";

/** Painel sticky de valores: subtotal, desconto editável e total. */
export function TotalsPanel({
  subtotal,
  descontoTipo,
  onDescontoTipo,
  descontoValor,
  onDescontoValor,
  total,
  saveLabel,
  saving,
  onSave,
}: {
  subtotal: number;
  descontoTipo: DiscountType;
  onDescontoTipo: (t: DiscountType) => void;
  descontoValor: number;
  onDescontoValor: (v: number) => void;
  total: number;
  saveLabel: string;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader>
        <CardTitle>Valores</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <Money value={subtotal} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="desconto-tipo">Desconto</Label>
            <Select value={descontoTipo} onValueChange={onDescontoTipo}>
              <SelectTrigger id="desconto-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="valor">R$</SelectItem>
                <SelectItem value="percentual">%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="desconto-valor">&nbsp;</Label>
            <Input
              id="desconto-valor"
              type="number"
              min={0}
              step="any"
              className="text-right font-mono tabular"
              value={descontoValor}
              onChange={(e) => onDescontoValor(e.target.valueAsNumber || 0)}
            />
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Total</span>
          <Money value={total} className="font-semibold text-lg" />
        </div>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Salvando…" : saveLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
