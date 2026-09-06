import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

const plans = [
  { name: "TOP Lista", price: "S/ 50 x 7 días" },
  { name: "BANNER Carousel", price: "S/ 75 x 7 días" },
];

export function PromoBanner() {
  return (
    <div className="rounded-md bg-gradient-to-br from-primary to-accent p-8 text-center text-white">
      <Star className="mx-auto mb-2 h-8 w-8 fill-amber-300 text-amber-300" />
      <h2 className="text-2xl font-bold">DESTACAR MI ANUNCIO</h2>
      <p className="mt-1 text-white/80">Aparece en primeros resultados y aumenta visibilidad</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <button
            key={plan.name}
            className="rounded-md border border-white/40 px-6 py-4 text-center transition hover:bg-white/10"
          >
            <p className="font-semibold">{plan.name}</p>
            <p className="text-sm text-white/80">{plan.price}</p>
          </button>
        ))}
      </div>
      <Button variant="secondary" fullWidth className="mt-4 bg-white text-primary hover:bg-white/90">
        Contactar admin vía Telegram
      </Button>
    </div>
  );
}
