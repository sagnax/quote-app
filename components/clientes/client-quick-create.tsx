"use client";

import { Plus } from "lucide-react";
import { type ReactNode, useState } from "react";
import { ClientForm } from "@/components/clientes/client-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Client } from "@/lib/validations/client";

/**
 * Dialog reutilizável de criação rápida de cliente.
 * Uso no F3 (dentro do fluxo de orçamento) e na página /clientes.
 */
export function ClientQuickCreate({
  trigger,
  onCreated,
}: {
  trigger?: ReactNode;
  onCreated?: (client: Client) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus aria-hidden />
            Novo cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo cliente</DialogTitle>
          <DialogDescription>
            Cadastre para vincular aos orçamentos.
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          submitLabel="Criar cliente"
          onSuccess={(client) => {
            setOpen(false);
            onCreated?.(client);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
