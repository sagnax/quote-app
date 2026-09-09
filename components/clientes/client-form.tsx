"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import {
  CLIENT_TIPO_LABEL,
  type Client,
  type ClientFormValues,
  clientSchema,
} from "@/lib/validations/client";

const EMPTY: ClientFormValues = {
  nome: "",
  tipo: "pf",
  cpf_cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  observacoes: "",
};

// Campos opcionais: string vazia vira undefined para o `.optional()` do Zod.
const optionalField = {
  setValueAs: (v: unknown) =>
    typeof v === "string" && v === "" ? undefined : v,
} as const;

export function ClientForm({
  initial,
  submitLabel = "Salvar cliente",
  onSuccess,
}: {
  /** Presente no modo edição; ausente no modo criação. */
  initial?: Client;
  submitLabel?: string;
  onSuccess?: (client: Client) => void;
}) {
  const [saving, setSaving] = useState(false);
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: initial
      ? {
          nome: initial.nome,
          tipo: initial.tipo,
          cpf_cnpj: initial.cpf_cnpj ?? "",
          email: initial.email ?? "",
          telefone: initial.telefone ?? "",
          endereco: initial.endereco ?? "",
          observacoes: initial.observacoes ?? "",
        }
      : EMPTY,
  });

  async function onSubmit(values: ClientFormValues) {
    setSaving(true);
    const supabase = createClient();
    try {
      const payload = {
        nome: values.nome,
        tipo: values.tipo,
        cpf_cnpj: values.cpf_cnpj ?? null,
        email: values.email ?? null,
        telefone: values.telefone ?? null,
        endereco: values.endereco ?? null,
        observacoes: values.observacoes ?? null,
        updated_at: new Date().toISOString(),
      };

      let userId = initial?.user_id;
      if (!initial) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Sessão expirada. Entre novamente.");
        userId = user.id;
      }

      const query = initial
        ? supabase.from("clients").update(payload).eq("id", initial.id)
        : supabase.from("clients").insert({ ...payload, user_id: userId });

      const { data, error } = await query.select().single();
      if (error) throw error;

      toast.success(initial ? "Cliente atualizado!" : "Cliente criado!");
      onSuccess?.(data as Client);
    } catch (err) {
      toast.error("Não foi possível salvar.", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  const errors = form.formState.errors;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="client-nome">Nome / Razão social</Label>
          <Input
            id="client-nome"
            placeholder="Ex: Maria Silva"
            {...form.register("nome")}
          />
          {errors.nome ? (
            <p className="text-destructive text-sm">{errors.nome.message}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="client-tipo">Tipo</Label>
          <Controller
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="client-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pf">{CLIENT_TIPO_LABEL.pf}</SelectItem>
                  <SelectItem value="pj">{CLIENT_TIPO_LABEL.pj}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipo ? (
            <p className="text-destructive text-sm">{errors.tipo.message}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="client-doc">CPF / CNPJ</Label>
          <Input
            id="client-doc"
            placeholder="Opcional"
            {...form.register("cpf_cnpj", optionalField)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="client-tel">Telefone / WhatsApp</Label>
          <Input
            id="client-tel"
            placeholder="(11) 99999-9999"
            {...form.register("telefone", optionalField)}
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="client-email">E-mail</Label>
        <Input
          id="client-email"
          type="email"
          placeholder="cliente@email.com"
          {...form.register("email", optionalField)}
        />
        {errors.email ? (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="client-end">Endereço</Label>
        <Input
          id="client-end"
          placeholder="Rua, número, bairro, cidade/UF"
          {...form.register("endereco", optionalField)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="client-obs">Observações</Label>
        <Textarea
          id="client-obs"
          rows={3}
          {...form.register("observacoes", optionalField)}
        />
      </div>
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
