"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

/**
 * Recebe os retornos de e-mail do Supabase Auth (magic link, confirmação de
 * cadastro e recuperação de senha) em dois formatos:
 * - `?code=...` (PKCE): troca pelo par de tokens via exchangeCodeForSession.
 * - `#access_token=...` (fragmento): o próprio createBrowserClient detecta a
 *   sessão na URL (detectSessionInUrl); aqui só aguardamos a sessão existir.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const next = params.get("next") ?? "/configuracoes";
    let done = false;

    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      if (ok) {
        router.replace(next);
        router.refresh();
      } else {
        setErro(true);
      }
    };

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setErro(true);
        else finish(true);
      });
      const t = setTimeout(() => finish(false), 10000);
      return () => clearTimeout(t);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(true);
    });
    const t = setTimeout(() => finish(false), 10000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, [router]);

  if (erro) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Link inválido ou expirado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Solicite um novo link e tente novamente.{" "}
              <a
                href="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Voltar ao login
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Confirmando acesso…</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Aguarde um instante.</p>
        </CardContent>
      </Card>
    </div>
  );
}
