"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { AdminFeaturedListing } from "@/lib/db/admin-queries";

const tabs = ["Activos", "Próximos a vencer", "Histórico"] as const;

function daysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function FeaturedTable({ initialListings }: { initialListings: AdminFeaturedListing[] }) {
  const [listings, setListings] = useState(initialListings);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Activos");
  const [busyId, setBusyId] = useState<string | null>(null);

  // El padre (Server Component) re-fetch tras router.refresh() (p.ej. al crear
  // un destacado nuevo); useState solo toma initialListings en el primer mount,
  // así que hay que re-sincronizar explícitamente cuando cambia la prop.
  useEffect(() => {
    setListings(initialListings);
  }, [initialListings]);

  const filtered = listings.filter((item) => {
    if (item.status !== "ACTIVE") return tab === "Histórico";
    const left = daysLeft(item.end_date);
    if (tab === "Activos") return left > 2;
    if (tab === "Próximos a vencer") return left <= 2;
    return false;
  });

  async function handleCancel(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/admin/featured/${id}`, { method: "PUT" });
    if (res.ok) {
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "CANCELLED" } : l)));
    }
    setBusyId(null);
  }

  return (
    <div>
      <div className="mb-4 flex gap-6 border-b border-border text-sm font-semibold">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 pb-3",
              tab === t ? "border-primary text-primary" : "border-transparent text-dark/40",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-dark/40">No hay listings en esta categoría.</p>
      ) : (
        <div className="overflow-x-auto rounded-md ring-1 ring-black/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-light_bg text-xs font-semibold uppercase tracking-wide text-dark/50">
              <tr>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Días</th>
                <th className="px-4 py-3">Pinned</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => {
                const left = daysLeft(item.end_date);
                return (
                  <tr key={item.id} className={cn(item.status === "ACTIVE" && left <= 1 && "bg-warning-light/40")}>
                    <td className="px-4 py-3 font-medium text-dark">{item.model_name}</td>
                    <td className="px-4 py-3 text-dark/70">{item.type}</td>
                    <td className="px-4 py-3 text-dark/70">
                      {new Date(item.start_date).toLocaleDateString("es-PE", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-dark/70">
                      {new Date(item.end_date).toLocaleDateString("es-PE", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-dark/70">
                      {item.status === "ACTIVE" ? left : "-"}{" "}
                      {item.status === "ACTIVE" && left <= 1 && <span title="Por vencer">⚠️</span>}
                    </td>
                    <td className="px-4 py-3 text-dark/70">{item.is_pinned ? "✓" : "-"}</td>
                    <td className="px-4 py-3 text-dark/70">{item.status}</td>
                    <td className="px-4 py-3">
                      {item.status === "ACTIVE" && (
                        <Button
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          disabled={busyId === item.id}
                          onClick={() => handleCancel(item.id)}
                        >
                          {busyId === item.id ? "..." : "Cancelar"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
