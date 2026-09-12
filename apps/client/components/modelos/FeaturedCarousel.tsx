"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import type { Model } from "@proyecto-model/types";
import { cn } from "@/lib/cn";

export function FeaturedCarousel({ models }: { models: Model[] }) {
  const [index, setIndex] = useState(0);
  if (models.length === 0) return null;
  const model = models[index % models.length];

  const prev = () => setIndex((i) => (i - 1 + models.length) % models.length);
  const next = () => setIndex((i) => (i + 1) % models.length);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gradient-to-br from-dark/50 to-primary via-40% via-accent md:max-h-96">
      <div className="absolute inset-0 flex items-center justify-center text-white/60">
        Modelo destacada
      </div>
      <button
        onClick={prev}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white hover:bg-white/50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Siguiente"
        className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white hover:bg-white/50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <Link
        href={`/modelos/${model.slug}`}
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white"
      >
        <p className="text-lg font-bold">{model.name.split(" ")[0]}</p>
        <p className="flex items-center gap-1 text-sm text-white/80">
          {model.age} años &bull; {model.gender === "WOMAN" ? "Mujer" : "Hombre"} &bull; {model.city}
          {model.is_verified && (
            <span className="ml-1 inline-flex items-center gap-1">
              <BadgeCheck className="h-4 w-4 text-emerald-300" /> Verificado
            </span>
          )}
        </p>
      </Link>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {models.map((m, i) => (
          <span
            key={m.id}
            className={cn("h-1.5 w-1.5 rounded-full bg-white", i === index ? "opacity-100" : "opacity-40")}
          />
        ))}
      </div>
    </div>
  );
}
