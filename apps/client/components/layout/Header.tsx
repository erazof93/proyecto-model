"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useSession } from "@/hooks/useSession";

export function Header() {
  const { user, loading } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-dark md:flex">
          <Link href="/modelos" className="hover:text-primary">
            Modelos
          </Link>
          <Link href="/modelo/dashboard" className="hover:text-primary">
            Soy modelo
          </Link>
        </nav>

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
    </header>
  );
}
