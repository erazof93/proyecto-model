import Link from "next/link";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cities, serviceOptions } from "@/lib/mock-data";

const genders = [
  { value: "WOMAN", label: "Mujer" },
  { value: "MAN", label: "Hombre" },
  { value: "TRANSGENDER", label: "Transexual" },
];

export type CurrentFilters = { gender?: string; city?: string; service?: string };

export function FilterSidebar({ current = {} }: { current?: CurrentFilters }) {
  return (
    <aside className="w-full flex-shrink-0 space-y-6 border-border p-6 lg:w-64 lg:border-r">
      <form action="/modelos" method="GET" className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Género</p>
          <div className="space-y-2">
            {genders.map((g) => (
              <Checkbox
                key={g.value}
                id={`g-${g.value}`}
                name="gender"
                type="radio"
                value={g.value}
                label={g.label}
                defaultChecked={current.gender === g.value}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Servicio</p>
          <div className="space-y-2">
            {serviceOptions.slice(0, 2).map((s) => (
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
