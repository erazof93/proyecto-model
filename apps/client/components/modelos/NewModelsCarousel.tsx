"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Model } from "@proyecto-model/types";
import { ModelCard } from "@/components/modelos/ModelCard";
import { cn } from "@/lib/cn";

/**
 * "Nuevas integrantes": grid en tablet/desktop (md: 2 col, lg: 4 col) y
 * carrusel horizontal con scroll-snap + flechas en móvil (< md).
 * Recibe objetos planos (frontera Server → Client), no instancias de entity.
 */
export function NewModelsCarousel({
  models,
  featuredIds = [],
}: {
  models: Model[];
  featuredIds?: string[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(models.length > 1);
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

  const nudge = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={sync}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 lg:grid-cols-4",
        )}
      >
        {models.map((m) => (
          <div
            key={m.id}
            className="w-[78%] flex-shrink-0 snap-start sm:w-[46%] md:w-auto"
          >
            <ModelCard model={m} featured={featured.has(m.id)} />
          </div>
        ))}
      </div>

      {/* Flechas: solo móvil (en md+ es un grid y no hacen falta). */}
      <div className="mt-3 flex items-center justify-between md:hidden">
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={!canPrev}
          aria-label="Anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white transition disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-xs text-dark/40">Desliza para ver más</span>
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
