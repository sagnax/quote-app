"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  company_name: z.string().optional(),
  phone: z.string().optional(),
  validade_padrao_dias: z
    .number("Informe um número de dias.")
    .int()
    .min(1, "Mínimo 1 dia.")
    .max(365, "Máximo 365 dias."),
  condicoes_padrao: z.string().optional(),
  prefixo_numero: z.string().max(10).optional(),
});

export type SettingsInitial = {
  name: string;
  company_name: string;
  phone: string;
  logo_url: string;
  validade_padrao_dias: number;
  condicoes_padrao: string;
  prefixo_numero: string;
};

export function SettingsForm({
  userId,
  initial,
}: {
  userId: string;
  initial: SettingsInitial;
}) {
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(initial.logo_url);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial.name,
      company_name: initial.company_name,
      phone: initial.phone,
      validade_padrao_dias: initial.validade_padrao_dias,
      condicoes_padrao: initial.condicoes_padrao,
      prefixo_numero: initial.prefixo_numero,
    },
  });

  function onLogoChange(file: File | null) {
    if (!file) {
      setLogoFile(null);
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Logo inválido.", {
        description: "Use PNG ou JPG.",
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo muito grande.", {
        description: "Máximo 2MB.",
      });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: z.infer<typeof schema>) {
    setSaving(true);
    const supabase = createClient();
    try {
      let logoUrl = initial.logo_url;

      if (logoFile) {
        const ext = logoFile.type === "image/png" ? "png" : "jpg";
        const path = `${userId}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(path, logoFile, { upsert: true, contentType: logoFile.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("logos").getPublicUrl(path);
        logoUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          name: values.name,
          company_name: values.company_name || null,
          phone: values.phone || null,
          logo_url: logoUrl || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (profileError) throw profileError;

      const { error: settingsError } = await supabase
        .from("quote_settings")
        .upsert(
          {
            user_id: userId,
            condicoes_padrao: values.condicoes_padrao || "",
            validade_padrao_dias: values.validade_padrao_dias,
            prefixo_numero: values.prefixo_numero || "",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      if (settingsError) throw settingsError;

      toast.success("Configurações salvas!");
    } catch (err) {
      toast.error("Não foi possível salvar.", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="cfg-name">Seu nome</Label>
          <Input id="cfg-name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cfg-company">Empresa</Label>
          <Input
            id="cfg-company"
            placeholder="Nome fantasia / razão social"
            {...form.register("company_name")}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cfg-phone">Telefone / WhatsApp</Label>
          <Input
            id="cfg-phone"
            placeholder="(11) 99999-9999"
            {...form.register("phone")}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="cfg-prefix">Prefixo da numeração</Label>
          <Input
            id="cfg-prefix"
            placeholder="Ex: 2026 (vazio = só ano)"
            {...form.register("prefixo_numero")}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="cfg-logo">Logo (PNG ou JPG, até 2MB)</Label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Logo da empresa"
              width={56}
              height={56}
              unoptimized
              className="size-14 rounded-lg border bg-muted object-contain"
            />
          ) : (
            <span className="flex size-14 items-center justify-center rounded-lg border border-dashed text-muted-foreground text-xs">
              Sem logo
            </span>
          )}
          <Input
            id="cfg-logo"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="cfg-validade">Validade padrão (dias)</Label>
          <Input
            id="cfg-validade"
            type="number"
            min={1}
            max={365}
            {...form.register("validade_padrao_dias", { valueAsNumber: true })}
          />
          {form.formState.errors.validade_padrao_dias ? (
            <p className="text-destructive text-sm">
              {form.formState.errors.validade_padrao_dias.message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="cfg-condicoes">Condições padrão do orçamento</Label>
        <Textarea
          id="cfg-condicoes"
          rows={4}
          placeholder="Ex: Pagamento 50% entrada + 50% na entrega. Prazo de execução 15 dias úteis."
          {...form.register("condicoes_padrao")}
        />
      </div>

      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando…" : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}
