"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/cn";

/** Filtro de género global. Orden fijo (Mujer | Hombre | Trans); "Mujer"
 *  (WOMAN) es el preseleccionado cuando la URL no trae `?gender`. */
const GENDERS = [
  { value: "WOMAN", label: "Mujer" },
  { value: "MAN", label: "Hombre" },
  { value: "TRANSGENDER", label: "Trans" },
] as const;

const DEFAULT_GENDER = "WOMAN";

/** Presentacional puro: recibe el género activo ya resuelto. */
function GenderTabs({ active, className }: { active: string; className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="group"
      aria-label="Filtrar por género"
    >
      {GENDERS.map(({ value, label }) => {
        const isActive = value === active;
        return (
          <Link
            key={value}
            href={`/modelos?gender=${value}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              isActive
                ? "bg-gradient-to-br from-primary to-accent text-white shadow-sm"
                : "bg-light_bg text-dark/70 hover:bg-secondary/30",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

/** Lee `?gender` de la URL (client-only). Envuelto en <Suspense> por el
 *  requisito de Next de aislar useSearchParams del prerender. */
function GenderTabsLive({ className }: { className?: string }) {
  const params = useSearchParams();
  const g = params.get("gender");
  const active = g === "MAN" || g === "TRANSGENDER" ? g : DEFAULT_GENDER;
  return <GenderTabs active={active} className={className} />;
}

function GenderTabsBoundary({ className }: { className?: string }) {
  return (
    <Suspense fallback={<GenderTabs active={DEFAULT_GENDER} className={className} />}>
      <GenderTabsLive className={className} />
    </Suspense>
  );
}

export function Header() {
  const { user, loading } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-dark lg:flex">
          <Link href="/modelos" className="hover:text-primary">
            Modelos
          </Link>
          <Link href="/modelo/dashboard" className="hover:text-primary">
            Soy modelo
          </Link>
        </nav>

        <GenderTabsBoundary className="hidden md:flex" />

        {loading ? (
          <div className="h-9 w-32" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-dark sm:inline">{user.username}</span>
            <LogoutButton />
          </div>
        ) : (
          <Link href="/login">
            <Button variant="primary" className="px-6 py-2.5">
              Iniciar sesión
            </Button>
          </Link>
        )}
      </div>

      {/* Mobile: género en una fila propia bajo el header */}
      <div className="border-t border-border px-4 py-2 md:hidden">
        <GenderTabsBoundary className="justify-center" />
      </div>
    </header>
  );
}
