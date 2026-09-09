"use client";

import { useRouter } from "next/navigation";
import { ClientForm } from "@/components/clientes/client-form";
import type { Client } from "@/lib/validations/client";

export function EditClientForm({ client }: { client: Client }) {
  const router = useRouter();
  return (
    <ClientForm
      initial={client}
      submitLabel="Salvar alterações"
      onSuccess={() => router.refresh()}
    />
  );
}
