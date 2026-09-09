"use client";

import { Check, Copy, MessageCircle, Printer, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildPublicQuoteLink,
  buildQuoteShareText,
  buildWhatsAppLink,
} from "@/lib/share";
import { createClient } from "@/lib/supabase/client";

/**
 * Ações de compartilhamento do orçamento (dono): imprimir/PDF via diálogo
 * de impressão, link WhatsApp, copiar link e regenerar token.
 * No MVP o PDF é anexado manualmente: Imprimir → salvar como PDF.
 */
export function QuoteSharePanel({
  quoteId,
  token,
  numero,
  total,
  validadeEm,
  clientName,
  clientPhone,
}: {
  quoteId: string;
  token: string;
  numero: string;
  total: number;
  validadeEm: string | null;
  clientName: string;
  clientPhone: string | null;
}) {
  const router = useRouter();
  const [currentToken, setCurrentToken] = useState(token);
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = origin ? buildPublicQuoteLink(origin, currentToken) : "";
  const message = origin
    ? buildQuoteShareText({
        clientName,
        numero,
        total,
        validadeEm,
        link,
      })
    : "";

  async function onCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar.", {
        description: "Copie manualmente o link abaixo.",
      });
    }
  }

  async function onRegenerate() {
    setBusy(true);
    const supabase = createClient();
    const next = crypto.randomUUID();
    const { error } = await supabase
      .from("quotes")
      .update({ public_token: next, updated_at: new Date().toISOString() })
      .eq("id", quoteId);
    setBusy(false);
    if (error) {
      toast.error("Não foi possível regenerar.", {
        description: error.message,
      });
      return;
    }
    setCurrentToken(next);
    toast.success("Novo link gerado! O anterior foi invalidado.");
    router.refresh();
  }

  return (
    <div className="no-print flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="grid gap-1.5">
        <Label htmlFor="share-link">Link público (expira com a validade)</Label>
        <div className="flex gap-2">
          <Input
            id="share-link"
            readOnly
            value={link}
            placeholder="Carregando…"
          />
          <Button
            variant="outline"
            size="icon"
            aria-label="Copiar link"
            onClick={onCopy}
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => window.print()}
          disabled={!link}
        >
          <Printer aria-hidden />
          Imprimir / PDF
        </Button>
        <Button variant="outline" asChild disabled={!message}>
          <a
            href={message ? buildWhatsAppLink(clientPhone, message) : "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden />
            WhatsApp
          </a>
        </Button>
        <Button variant="ghost" onClick={onRegenerate} disabled={busy}>
          <RefreshCw aria-hidden />
          {busy ? "Regenerando…" : "Regenerar link"}
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Para enviar o PDF: Imprimir → “Salvar como PDF” e anexe o arquivo na
        conversa do WhatsApp.
      </p>
    </div>
  );
}
