"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Model } from "@proyecto-model/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ModelosTable({ initialModelos }: { initialModelos: Model[] }) {
  const [modelos, setModelos] = useState(initialModelos);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Si el padre (Server Component) vuelve a renderizar con props nuevas
  // (p.ej. tras cambiar el filtro), re-sincroniza: useState solo toma
  // initialModelos en el primer mount.
  useEffect(() => {
    setModelos(initialModelos);
  }, [initialModelos]);

  async function toggleVerified(id: string, next: boolean) {
    setBusyId(id);
    const res = await fetch(`/api/admin/modelos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_verified: next }),
    });
    if (res.ok) {
      setModelos((prev) => prev.map((m) => (m.id === id ? { ...m, is_verified: next } : m)));
    }
    setBusyId(null);
  }

  if (modelos.length === 0) {
    return <p className="py-8 text-center text-dark/40">No hay modelos que coincidan.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md ring-1 ring-black/5">
      <table className="w-full text-left text-sm">
        <thead className="bg-light_bg text-xs font-semibold uppercase tracking-wide text-dark/50">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Usuario</th>
            <th className="px-4 py-3">Género</th>
            <th className="px-4 py-3">Edad</th>
            <th className="px-4 py-3">Ciudad</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {modelos.map((modelo) => (
            <tr key={modelo.id}>
              <td className="px-4 py-3 font-medium text-dark">{modelo.name}</td>
              <td className="px-4 py-3 text-dark/60">@{modelo.username}</td>
              <td className="px-4 py-3 text-dark/70">
                {modelo.gender === "WOMAN" ? "Mujer" : modelo.gender === "MAN" ? "Hombre" : "Trans"}
              </td>
              <td className="px-4 py-3 text-dark/70">{modelo.age}</td>
              <td className="px-4 py-3 text-dark/70">{modelo.city}</td>
              <td className="px-4 py-3">
                <Badge variant={modelo.is_verified ? "success" : "warning"}>
                  {modelo.is_verified ? "Verificada" : "Pendiente"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link href={`/dashboard/modelos/${modelo.id}`}>
                    <Button variant="secondary" className="px-3 py-1.5 text-xs">
                      Ver
                    </Button>
                  </Link>
                  <Button
                    variant={modelo.is_verified ? "secondary" : "success"}
                    className="px-3 py-1.5 text-xs"
                    disabled={busyId === modelo.id}
                    onClick={() => toggleVerified(modelo.id, !modelo.is_verified)}
                  >
                    {modelo.is_verified ? "Quitar verificación" : "Verificar"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
