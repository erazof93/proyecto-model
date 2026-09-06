import { BadgeCheck, MessageCircle, Instagram, Music2, Send, Star } from "lucide-react";
import type { Model, Review } from "@proyecto-model/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ModelProfile({ model, reviews }: { model: Model; reviews: Review[] }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="relative flex h-96 items-end rounded-md bg-gradient-to-br from-dark/50 to-primary p-4">
          <span className="text-sm text-white/70">Foto principal</span>
          <span className="absolute bottom-4 left-4 text-xl font-bold text-white">{model.name.split(" ")[0]}</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-dark">{model.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-dark/50">
            {model.age} años &bull; {model.gender === "WOMAN" ? "Mujer" : "Hombre"} &bull; {model.city}
            {model.is_verified && (
              <span className="ml-1 inline-flex items-center gap-1 text-emerald-600">
                <BadgeCheck className="h-4 w-4" /> Verificado
              </span>
            )}
          </p>
        </div>

        <p className="text-dark/80">{model.bio}</p>

        <div>
          <h2 className="mb-2 font-semibold text-dark">Servicios que ofrece</h2>
          <div className="flex flex-wrap gap-2">
            {model.services?.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-semibold text-dark">Contacto</h2>
          <div className="space-y-2">
            <Button fullWidth className="justify-start gap-2">
              <MessageCircle className="h-4 w-4" /> Contactar por WhatsApp
            </Button>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="secondary" className="gap-2">
                <Instagram className="h-4 w-4" /> Instagram
              </Button>
              <Button variant="secondary" className="gap-2">
                <Music2 className="h-4 w-4" /> TikTok
              </Button>
              <Button variant="secondary" className="gap-2">
                <Send className="h-4 w-4" /> Telegram
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-semibold text-dark">Reseñas</h2>
          <Button variant="secondary" fullWidth className="mb-3">
            Dejar reseña
          </Button>
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-light_bg p-4 shadow-none ring-0">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-medium text-dark">Juan Pérez</p>
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-dark/70">{review.comment}</p>
                <p className="mt-1 text-xs text-dark/40">Hace 2 semanas</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-3 font-semibold text-dark">Galería</h2>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-md bg-light_bg" />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-dark">Info Adicional</h2>
          <div className="space-y-3">
            {model.languages && (
              <InfoBox label="Idiomas" value={model.languages.join(", ")} />
            )}
            {model.cities_travel && (
              <InfoBox label="Ciudades" value={model.cities_travel.join(", ")} />
            )}
            <InfoBox label="Disponibilidad" value="24 horas disponible" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-light_bg p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-dark/40">{label}</p>
      <p className="mt-1 text-sm text-dark">{value}</p>
    </div>
  );
}
