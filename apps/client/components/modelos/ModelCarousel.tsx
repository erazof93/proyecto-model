"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Model } from "@proyecto-model/types";
import { ModelCard } from "@/components/modelos/ModelCard";
import { cn } from "@/lib/cn";

/**
 * Carrusel horizontal de cards en TODOS los tamaños (móvil ~1, sm ~2, lg 4
 * visibles). Flechas que avanzan de card en card. Con `autoplay` se desliza
 * solo cada `autoplayInterval` ms, se pausa al pasar el ratón por encima y
 * respeta `prefers-reduced-motion`.
 *
 * Recibe objetos planos (frontera Server → Client), no instancias de entity.
 */
export function ModelCarousel({
  models,
  featuredIds = [],
  autoplay = false,
  autoplayInterval = 5000,
}: {
  models: Model[];
  featuredIds?: string[];
  autoplay?: boolean;
  autoplayInterval?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(models.length > 1);
  const [paused, setPaused] = useState(false);
  const featured = new Set(featuredIds);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync]);

  /** Avanza/retrocede exactamente una card (ancho card + gap, medido del DOM). */
  const nudge = useCallback((dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const kids = el.children;
    const step =
      kids.length > 1
        ? (kids[1] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft
        : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  // Autoplay: avanza 1 card; al final vuelve al inicio. Pausa en hover.
  useEffect(() => {
    if (!autoplay || paused || models.length <= 1) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        nudge(1);
      }
    }, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, paused, models.length, autoplayInterval, nudge]);

  const hint = autoplay
    ? paused
      ? "En pausa"
      : "Deslizando solo"
    : "Desliza para ver más";

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={sync}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {models.map((m) => (
          <div key={m.id} className="w-[78%] flex-shrink-0 snap-start sm:w-1/2 lg:w-1/4">
            <ModelCard model={m} featured={featured.has(m.id)} />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={!canPrev}
          aria-label="Anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white transition disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xs text-dark/40">{hint}</span>
        <button
          type="button"
          onClick={() => nudge(1)}
          disabled={!canNext}
          aria-label="Siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white transition disabled:opacity-40"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
