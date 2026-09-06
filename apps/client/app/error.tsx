"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-light_bg px-6 text-center">
      <h1 className="text-2xl font-bold text-dark">Algo salió mal</h1>
      <p className="text-dark/60">Ocurrió un error inesperado. Intenta nuevamente.</p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
