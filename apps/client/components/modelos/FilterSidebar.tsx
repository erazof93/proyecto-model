import Link from "next/link";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export type CurrentFilters = {
  gender?: string;
  city?: string;
  service?: string;
  isNew?: boolean;
  type?: "TOP" | "BANNER";
};
export type FilterOptions = { cities: string[]; genders: string[]; services: string[] };

export function FilterSidebar({
  current = {},
  options,
}: {
  current?: CurrentFilters;
  options?: FilterOptions;
}) {
  const services = options?.services ?? [];
  const cities = options?.cities ?? [];

  return (
    <aside className="hidden w-full flex-shrink-0 space-y-6 border-border p-6 lg:block lg:w-64 lg:border-r">
      <form action="/modelos" method="GET" className="space-y-6">
        {/* Género se controla desde el Header (GenderTabs). Se arrastra oculto
            para no perderlo al aplicar el resto de filtros. */}
        <input type="hidden" name="gender" value={current.gender ?? ""} />
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
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dark/40">Tipo</p>
          <Select name="type" defaultValue={current.type ?? ""} aria-label="Tipo">
            <option value="">Todas las modelos</option>
            <option value="TOP">Solo VIP destacadas</option>
            <option value="BANNER">Solo BANNER</option>
          </Select>
        </div>
        <div>
          <Checkbox
            id="f-isnew"
            name="isNew"
            value="true"
            label="Solo nuevas integrantes"
            defaultChecked={current.isNew ?? false}
          />
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
