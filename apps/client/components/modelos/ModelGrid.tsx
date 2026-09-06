import type { Model } from "@proyecto-model/types";
import { ModelCard } from "@/components/modelos/ModelCard";
import { cn } from "@/lib/cn";

export function ModelGrid({ models, className }: { models: Model[]; className?: string }) {
  if (models.length === 0) {
    return <p className="py-16 text-center text-dark/50">No se encontraron modelos.</p>;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {models.map((model) => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  );
}
