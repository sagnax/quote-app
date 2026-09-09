"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

const passwordSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "Senha com no mínimo 6 caracteres."),
});

const otpSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/configuracoes";
  const callbackError = searchParams.get("erro");
  const [loading, setLoading] = useState<"password" | "otp" | null>(null);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: "" },
  });

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setLoading("password");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    setLoading(null);
    if (error) {
      toast.error("Não foi possível entrar.", { description: error.message });
      return;
    }
    toast.success("Bem-vindo de volta!");
    router.push(next);
    router.refresh();
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    setLoading("otp");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(null);
    if (error) {
      toast.error("Não foi possível enviar o link.", {
        description: error.message,
      });
      return;
    }
    toast.success("Link enviado!", {
      description: "Confira seu e-mail para entrar.",
    });
  }

  return (
    // suppressHydrationWarning: gerenciadores de senha injetam botão/estilos
    // nos inputs e o React 19 reclamaria do HTML diferente na hidratação.
    <Card suppressHydrationWarning>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse seus orçamentos com senha ou link mágico.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {callbackError ? (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            O link expirou ou é inválido. Tente novamente.
          </p>
        ) : null}
        <Tabs defaultValue="password">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="otp">Link mágico</TabsTrigger>
          </TabsList>
          <TabsContent value="password">
            <form
              className="flex flex-col gap-3 pt-2"
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            >
              <div className="grid gap-1.5">
                <Label htmlFor="login-email">E-mail</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  {...passwordForm.register("email")}
                />
                {passwordForm.formState.errors.email ? (
                  <p className="text-destructive text-sm">
                    {passwordForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register("password")}
                />
                {passwordForm.formState.errors.password ? (
                  <p className="text-destructive text-sm">
                    {passwordForm.formState.errors.password.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={loading !== null}>
                {loading === "password" ? "Entrando…" : "Entrar"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="otp">
            <form
              className="flex flex-col gap-3 pt-2"
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            >
              <div className="grid gap-1.5">
                <Label htmlFor="otp-email">E-mail</Label>
                <Input
                  id="otp-email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  {...otpForm.register("email")}
                />
                {otpForm.formState.errors.email ? (
                  <p className="text-destructive text-sm">
                    {otpForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={loading !== null}>
                {loading === "otp" ? "Enviando…" : "Enviar link mágico"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/recuperar-senha"
            className="text-primary underline-offset-4 hover:underline"
          >
            Esqueci a senha
          </Link>
          <Link
            href="/cadastro"
            className="text-primary underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
