"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "Senha com no mínimo 6 caracteres."),
});

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/configuracoes`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível criar a conta.", {
        description: error.message,
      });
      return;
    }
    if (data.session) {
      toast.success("Conta criada!");
      router.push("/configuracoes");
      router.refresh();
    } else {
      toast.success("Conta criada!", {
        description: "Confira seu e-mail para confirmar o cadastro.",
      });
    }
  }

  return (
    // suppressHydrationWarning: gerenciadores de senha injetam botão/estilos
    // nos inputs e o React 19 reclamaria do HTML diferente na hidratação.
    <Card suppressHydrationWarning>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Comece a gerar orçamentos profissionais em minutos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="signup-name">Nome</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              placeholder="Seu nome"
              {...form.register("name")}
            />
            {form.formState.errors.name ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="signup-email">E-mail</Label>
            <Input
              id="signup-email"
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
          <div className="grid gap-1.5">
            <Label htmlFor="signup-password">Senha</Label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-destructive text-sm">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Criando…" : "Criar conta"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
