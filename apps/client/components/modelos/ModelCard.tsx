import Link from "next/link";
import type { Model } from "@proyecto-model/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ModelCard({ model }: { model: Model }) {
  return (
    <Card className="flex flex-col overflow-hidden" data-testid={`model-card-${model.slug}`}>
      <div className="relative flex h-56 items-end bg-gradient-to-br from-dark/40 to-primary p-3">
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
