"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { AdminBannerRequest } from "@/lib/db/admin-queries";

const tabs = ["Pendientes", "Aprobadas", "Rechazadas"] as const;

const STATUS_FOR_TAB: Record<(typeof tabs)[number], AdminBannerRequest["status"]> = {
  Pendientes: "PENDING",
  Aprobadas: "APPROVED",
  Rechazadas: "REJECTED",
};

export function BannerRequestsTable({ initialRequests }: { initialRequests: AdminBannerRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Pendientes");
  const [busyId, setBusyId] = useState<string | null>(null);

  // El padre (Server Component) re-fetch tras router.refresh(); useState solo
  // toma initialRequests en el primer mount, hay que re-sincronizar.
  useEffect(() => setRequests(initialRequests), [initialRequests]);

  const filtered = requests.filter((r) => r.status === STATUS_FOR_TAB[tab]);

  async function handleReview(id: string, action: "approve" | "reject") {
    setBusyId(id);
    const res = await fetch(`/api/admin/banner-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const { request } = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? request : r)));
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
        <p className="py-8 text-center text-dark/40">No hay solicitudes en esta categoría.</p>
      ) : (
        <div className="overflow-x-auto rounded-md ring-1 ring-black/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-light_bg text-xs font-semibold uppercase tracking-wide text-dark/50">
              <tr>
                <th className="px-4 py-3">Modelo</th>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Fecha</th>
                {tab === "Pendientes" && <th className="px-4 py-3">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-dark">
                    {item.model_name} (@{item.model_username})
                  </td>
                  <td className="px-4 py-3 text-dark/70">{item.title}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-dark/50">
                    {item.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-dark/70">
                    {new Date(item.created_at).toLocaleDateString("es-PE", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  {tab === "Pendientes" && (
                    <td className="flex gap-2 px-4 py-3">
                      <Button
                        className="px-3 py-1.5 text-xs"
                        disabled={busyId === item.id}
                        onClick={() => handleReview(item.id, "approve")}
                      >
                        {busyId === item.id ? "..." : "Aprobar"}
                      </Button>
                      <Button
                        variant="danger"
                        className="px-3 py-1.5 text-xs"
                        disabled={busyId === item.id}
                        onClick={() => handleReview(item.id, "reject")}
                      >
                        Rechazar
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
