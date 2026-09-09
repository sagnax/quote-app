"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export function RecoveryForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível enviar o e-mail.", {
        description: error.message,
      });
      return;
    }
    toast.success("E-mail enviado!", {
      description: "Confira sua caixa de entrada para redefinir a senha.",
    });
  }

  return (
    // suppressHydrationWarning: gerenciadores de senha injetam botão/estilos
    // nos inputs e o React 19 reclamaria do HTML diferente na hidratação.
    <Card suppressHydrationWarning>
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Enviamos um link para você criar uma nova senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="recovery-email">E-mail</Label>
            <Input
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="voce@empresa.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Enviando…" : "Enviar link"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Voltar ao login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
