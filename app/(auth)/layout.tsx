import { FileText } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-bg flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
        <div className="flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FileText className="size-4" aria-hidden />
          </span>
          <span className="font-semibold text-lg tracking-tight">
            Quote App
          </span>
        </div>
        {children}
        <p className="text-center text-muted-foreground text-xs">
          Orçamentos profissionais em minutos
        </p>
      </div>
    </div>
  );
}
