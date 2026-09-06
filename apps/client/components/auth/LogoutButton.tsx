"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

export function LogoutButton({ className }: { className?: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await logout();
        router.push("/");
        router.refresh();
      }}
      className={cn("flex items-center gap-2 text-sm font-medium text-dark/70 hover:text-primary", className)}
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
