"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileEdit, Image, Sparkles, Star, MessageCircle } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/cn";

const links = [
  { href: "/modelo/dashboard/perfil", label: "Mi perfil", icon: FileEdit },
  { href: "/modelo/dashboard/fotos", label: "Mis fotos", icon: Image },
  { href: "/modelo/dashboard/servicios", label: "Mis servicios", icon: Sparkles },
  { href: "/modelo/dashboard/reviews", label: "Reseñas", icon: Star },
  { href: "/modelo/dashboard/contacto", label: "Contactar admin", icon: MessageCircle },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 flex-shrink-0 flex-col gap-1 bg-dark p-4">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-white/40">
        Menú
      </p>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href.endsWith("/perfil") && pathname === "/modelo/dashboard");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-gradient-to-br from-primary to-accent text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
      <div className="mt-4 border-t border-white/10 pt-4">
        <LogoutButton className="px-3 text-white/70 hover:text-white" />
      </div>
    </nav>
  );
}
