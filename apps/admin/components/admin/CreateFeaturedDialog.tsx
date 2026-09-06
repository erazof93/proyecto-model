"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";

type Modelo = { id: string; name: string; username: string };

// Mismos planes que se muestran en el dashboard de la modelo (PromoBanner):
// precio fijo total por 7 días, no una tarifa por día. Mantener un único
// origen de verdad para el pricing en vez de inventar un esquema "por día".
const PLANS = [
  { type: "TOP" as const, label: "TOP Lista", price: 50, durationDays: 7 },
  { type: "BANNER" as const, label: "BANNER Carousel", price: 75, durationDays: 7 },
];

export function CreateFeaturedDialog({
  open,
  onClose,
  models,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  models: Modelo[];
  onCreated: () => void;
}) {
  const [modelId, setModelId] = useState("");
  const [planIndex, setPlanIndex] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;
  const plan = PLANS[planIndex];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!modelId) {
      setError("Selecciona un modelo");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/admin/featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modelId,
        type: plan.type,
        price: plan.price,
        durationDays: plan.durationDays,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Error al crear el destacado");
      return;
    }

    setModelId("");
    setPlanIndex(0);
    onCreated();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-md bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-dark">Crear destacado</h2>

        {error && (
          <div className="mb-4 rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Modelo</label>
            <Select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              disabled={submitting}
              className="w-full"
            >
              <option value="">Selecciona un modelo...</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (@{m.username})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">Plan</label>
            <div className="space-y-2">
              {PLANS.map((p, i) => (
                <label
                  key={p.type}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm",
                    planIndex === i ? "border-primary bg-light_bg" : "border-border",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="plan"
                      checked={planIndex === i}
                      onChange={() => setPlanIndex(i)}
                      disabled={submitting}
                      className="accent-primary"
                    />
                    <strong>{p.label}</strong>
                  </span>
                  <span className="text-dark/50">
                    S/ {p.price} x {p.durationDays} días
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" fullWidth loading={submitting}>
              Crear destacado
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
