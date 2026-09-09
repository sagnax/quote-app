import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicQuoteNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Link inválido</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Este link de orçamento não existe ou foi revogado. Peça à empresa um
            novo link.
          </p>
          <div>
            <Button asChild>
              <Link href="/login">Ir para o Quote App</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
