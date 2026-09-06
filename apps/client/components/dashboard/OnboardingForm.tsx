"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const genders = ["Mujer", "Hombre", "Transexual"];

export function OnboardingForm({ username = "sofia.martinez" }: { username?: string }) {
  const [selected, setSelected] = useState("Mujer");

  return (
    <div>
      <h1 className="text-center text-2xl font-bold text-dark">Completa tu perfil</h1>
      <div className="mt-4 h-1.5 w-full rounded-full bg-light_bg">
        <div className="h-full w-1/2 rounded-full bg-primary" />
      </div>
      <p className="mt-1 text-center text-xs text-dark/40">Paso 1 de 2</p>

      <div className="mt-6 rounded-md bg-light_bg p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-dark/40">Usuario</p>
        <p className="font-semibold text-dark">{username}</p>
        <p className="text-xs text-dark/40">Tu usuario no puede cambiar</p>
      </div>

      <p className="mb-2 mt-6 font-medium text-dark">¿Cuál es tu género?</p>
      <div className="space-y-3">
        {genders.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setSelected(g)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left text-sm",
              selected === g ? "border-primary bg-light_bg" : "border-border",
            )}
          >
            <span
              className={cn(
                "h-4 w-4 rounded-full border",
                selected === g ? "border-4 border-primary" : "border-border",
              )}
            />
            {g}
          </button>
        ))}
      </div>

      <Button fullWidth className="mt-6">
        Siguiente
      </Button>
      <Button variant="outline" fullWidth className="mt-2 border-transparent">
        Completar después
      </Button>
    </div>
  );
}
