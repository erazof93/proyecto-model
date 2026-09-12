"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Star, BarChart3, LogOut, GalleryHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/providers/AuthProvider";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/modelos", label: "Modelos", icon: Users },
  { href: "/dashboard/featured", label: "Featured", icon: Star },
  { href: "/dashboard/banner-requests", label: "Banners", icon: GalleryHorizontal },
  { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <nav className="flex w-56 flex-shrink-0 flex-col gap-1 bg-dark p-4">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-white/40">
        Menú admin
      </p>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
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
      <button
        onClick={async () => {
          await logout();
          router.push("/login");
          router.refresh();
        }}
        className="mt-4 flex items-center gap-3 rounded-md border-t border-white/10 px-3 pt-4 text-sm font-medium text-white/70 hover:text-white"
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>
    </nav>
  );
}
