import type { ReviewStats } from "@proyecto-model/types";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/dashboard/RatingStars";

export function ReviewsStats({ total, avgRating, breakdown }: ReviewStats) {
  if (total === 0) {
    return (
      <div className="rounded-md bg-light_bg px-4 py-3 text-sm text-dark/60">
        Aún no tienes reseñas. Los clientes podrán dejarte reseñas después de contratar tus
        servicios.
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-dark/50">Calificación promedio</p>
          <p className="text-3xl font-bold text-dark">{avgRating.toFixed(1)}</p>
          <p className="mt-1 text-sm text-dark/40">
            Basado en {total} reseña{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RatingStars rating={avgRating} size="lg" />
        </div>
      </div>

      <div className="mt-6 space-y-2 border-t border-border pt-6">
        <p className="mb-3 text-sm font-semibold text-dark">Distribución de calificaciones</p>
        {([5, 4, 3, 2, 1] as const).map((stars) => {
          const count = breakdown[stars];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={stars} className="flex items-center gap-3">
              <span className="w-8 text-sm text-dark/60">{stars}★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-light_bg">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-right text-xs text-dark/40">{count}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
