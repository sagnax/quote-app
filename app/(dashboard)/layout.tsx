import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="no-print border-b bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="font-semibold tracking-tight">
              Quote App
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/dashboard"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/orcamentos"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Orçamentos
              </Link>
              <Link
                href="/clientes"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Clientes
              </Link>
              <Link
                href="/configuracoes"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Configurações
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
