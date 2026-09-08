"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

/**
 * Límite de error del panel: si una página del dashboard revienta (lo más
 * habitual: una query a Postgres que falla puntualmente), mostramos un panel
 * con reintento en vez de la pantalla de error genérica de Next.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/dashboard] error de render:", error);
  }, [error]);

  return (
    <div className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-md bg-light_bg p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-warning-dark" />
      <p className="font-semibold text-dark">No se pudo cargar esta sección</p>
      <p className="max-w-md text-sm text-dark/60">
        Puede ser un fallo temporal de la base de datos. Reintenta en unos segundos.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-gradient-to-br from-primary to-accent px-4 py-2 text-sm font-medium text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
