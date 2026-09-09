import { FileText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { NavLinks } from "@/components/dashboard/nav-links";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="no-print sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <FileText className="size-4" aria-hidden />
              </span>
              <span className="font-semibold tracking-tight">Quote App</span>
            </Link>
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
            <div className="hidden sm:block">
              <NavLinks />
            </div>
          </div>
          <LogoutButton />
        </div>
        <div className="border-t px-4 py-1.5 sm:hidden">
          <NavLinks />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
