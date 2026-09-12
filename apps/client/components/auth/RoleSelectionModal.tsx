"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@proyecto-model/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface RoleSelectionModalProps {
  isOpen: boolean;
  userId: string;
  onClose?: () => void;
}

const ROLE_OPTIONS: { value: Role; icon: string; title: string; description: string }[] = [
  { value: Role.CUSTOMER, icon: "👁️", title: "Cliente", description: "Buscar y contactar modelos" },
  { value: Role.MODEL, icon: "💃", title: "Modelo", description: "Ofrecer mis servicios" },
  { value: Role.BOTH, icon: "✨", title: "Ambos", description: "Cliente y modelo" },
];

export function RoleSelectionModal({ isOpen, userId, onClose }: RoleSelectionModalProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.CUSTOMER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleConfirm() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "No se pudo guardar tu elección");
        return;
      }

      onClose?.();
      if (selectedRole === Role.MODEL || selectedRole === Role.BOTH) {
        router.push("/modelo/dashboard/perfil");
      } else {
        router.push("/");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-dark">¿Cómo usarás la plataforma?</h2>
        <p className="mt-1 text-sm text-dark/60">
          Elige tu rol. Puedes cambiar después en configuración.
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {ROLE_OPTIONS.map(({ value, icon, title, description }) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition hover:bg-light_bg",
                selectedRole === value ? "border-primary" : "border-border",
              )}
            >
              <input
                type="radio"
                name="role"
                value={value}
                checked={selectedRole === value}
                onChange={() => setSelectedRole(value)}
                className="h-4 w-4 accent-primary"
              />
              <div>
                <p className="font-bold text-dark">
                  {icon} {title}
                </p>
                <p className="text-sm text-dark/60">{description}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <Button type="button" variant="outline" fullWidth disabled={loading} onClick={onClose}>
            Después
          </Button>
          <Button type="button" fullWidth loading={loading} onClick={handleConfirm}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
