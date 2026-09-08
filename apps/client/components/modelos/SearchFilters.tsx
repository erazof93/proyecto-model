import { Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export type FilterOptions = { cities: string[]; genders: string[]; services: string[] };

/** Etiqueta visible de cada valor de género del enum (la lista de opciones sí
 *  viene de la BD; esto solo traduce los códigos conocidos). */
const GENDER_LABELS: Record<string, string> = {
  WOMAN: "Mujer",
  MAN: "Hombre",
  TRANSGENDER: "Transexual",
};

export function SearchFilters({ options }: { options?: FilterOptions }) {
  const cities = options?.cities ?? [];
  const genders = options?.genders ?? [];
  const services = options?.services ?? [];

  return (
    <form action="/modelos" method="GET" className="border-b border-border bg-white px-6 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/30" />
          <Input name="q" placeholder="Buscar..." className="pl-9" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Select name="gender" label="Género" defaultValue="" className="sm:w-48">
            <option value="">Todos</option>
            {genders.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g] ?? g}
              </option>
            ))}
          </Select>
          <Select name="service" label="Servicio" defaultValue="" className="sm:w-56">
            <option value="">Todos</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select name="city" label="Ciudad" defaultValue="" className="sm:w-40">
            <option value="">Todas</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Button type="submit" className="sm:w-auto">
            Buscar
          </Button>
        </div>
      </div>
    </form>
  );
}
