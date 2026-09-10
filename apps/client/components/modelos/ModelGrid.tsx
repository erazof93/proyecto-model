import type { Model } from "@proyecto-model/types";
import { ModelCard } from "@/components/modelos/ModelCard";
import { cn } from "@/lib/cn";

export function ModelGrid({
  models,
  className,
  featuredIds,
  cardVariant,
  cardImageAspectRatio,
}: {
  models: Model[];
  className?: string;
  /** Ids de modelos con destacada TOP vigente → pinta el badge VIP en su card. */
  featuredIds?: Set<string>;
  /** Proporción de las cards (se propaga a <ModelCard>). */
  cardVariant?: "portrait" | "wide";
  /** Sobreescribe la proporción del media de cada card (se propaga a <ModelCard>). */
  cardImageAspectRatio?: string;
}) {
  if (models.length === 0) {
    return <p className="py-16 text-center text-dark/50">No se encontraron modelos.</p>;
  }

  return (
    <div
      className={cn(
        // Responsivo: 2 col en móvil, 3 en tablet, 4 en desktop; gap más
        // ajustado en móvil.
        "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4",
        className,
      )}
    >
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          featured={featuredIds?.has(model.id)}
          variant={cardVariant}
          imageAspectRatio={cardImageAspectRatio}
        />
      ))}
    </div>
  );
}
