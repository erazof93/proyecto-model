import Link from "next/link";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export type CurrentFilters = { gender?: string; city?: string; service?: string };
export type FilterOptions = { cities: string[]; genders: string[]; services: string[] };

/** Etiqueta visible de cada valor de género (la lista sí viene de la BD). */
const GENDER_LABELS: Record<string, string> = {
  WOMAN: "Mujer",
  MAN: "Hombre",
  TRANSGENDER: "Transexual",
};

export function FilterSidebar({
  current = {},
  options,
}: {
  current?: CurrentFilters;
  options?: FilterOptions;
}) {
  const genders = options?.genders ?? [];
  const services = options?.services ?? [];
  const cities = options?.cities ?? [];

  return (
    <aside className="w-full flex-shrink-0 space-y-6 border-border p-6 lg:w-64 lg:border-r">
      <form action="/modelos" method="GET" className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Género</p>
          <div className="space-y-2">
            <Checkbox
              id="g-all"
              name="gender"
              type="radio"
              value=""
              label="Todos"
              defaultChecked={!current.gender}
            />
            {genders.map((g) => (
              <Checkbox
                key={g}
                id={`g-${g}`}
                name="gender"
                type="radio"
                value={g}
                label={GENDER_LABELS[g] ?? g}
                defaultChecked={current.gender === g}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Servicio</p>
          <div className="space-y-2">
            <Checkbox
              id="s-all"
              name="service"
              type="radio"
              value=""
              label="Todos"
              defaultChecked={!current.service}
            />
            {services.map((s) => (
              <Checkbox
                key={s}
                id={`s-${s}`}
                name="service"
                type="radio"
                value={s}
                label={s}
                defaultChecked={current.service === s}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Ciudad</p>
          <Select name="city" defaultValue={current.city ?? ""} aria-label="Ciudad">
            <option value="">Todas</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Button type="submit">Aplicar</Button>
          <Link href="/modelos">
            <Button type="button" variant="outline" fullWidth>
              Limpiar
            </Button>
          </Link>
        </div>
      </form>
    </aside>
  );
}
