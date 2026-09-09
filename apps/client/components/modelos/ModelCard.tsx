import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import type { Model } from "@proyecto-model/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ModelCard({ model, featured = false }: { model: Model; featured?: boolean }) {
  return (
    <Card className="flex flex-col overflow-hidden" data-testid={`model-card-${model.slug}`}>
      <div className="relative flex h-56 items-end bg-gradient-to-br from-dark/40 to-primary p-3">
        {featured && (
          <span
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-primary to-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md ring-1 ring-white/25"
            aria-label="Modelo destacada VIP"
          >
            <Star className="h-3 w-3 fill-current" aria-hidden />
            VIP
          </span>
        )}
        {model.is_verified && (
          <span
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-md ring-1 ring-white/25"
            aria-label="Modelo verificada"
          >
            <BadgeCheck className="h-3 w-3" aria-hidden />
            Verificada
          </span>
        )}
        <span className="text-xs font-medium text-white/80">Foto principal</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-semibold text-dark">
            {model.name.split(" ")[0]}, {model.age}
          </p>
          <p className="text-sm text-dark/50">
            {model.gender === "WOMAN" ? "Mujer" : model.gender === "MAN" ? "Hombre" : "Trans"} &bull;{" "}
            {model.city}
          </p>
        </div>
        {model.services?.[0] && <Badge>{model.services[0]}</Badge>}
        <Link href={`/modelos/${model.slug}`} className="mt-auto">
          <Button fullWidth>Ver perfil</Button>
        </Link>
      </div>
    </Card>
  );
}
