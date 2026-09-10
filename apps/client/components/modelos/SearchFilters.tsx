import { Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FilterDrawer } from "@/components/modelos/FilterDrawer";

export type FilterOptions = { cities: string[]; genders: string[]; services: string[] };

const searchPlaceholder = "Buscar por nombre, usuario, ciudad o servicio…";

/**
 * Barra de búsqueda pública (home). El filtro de género vive ahora en el Header
 * (global); aquí solo se arrastra como campo oculto para no perderlo al enviar
 * el formulario. `currentGender` viene de la URL; por defecto "WOMAN" (Mujer).
 */
export function SearchFilters({
  options,
  currentGender = "WOMAN",
}: {
  options?: FilterOptions;
  currentGender?: string;
}) {
  const cities = options?.cities ?? [];

  return (
    <>
      {/* Desktop: búsqueda + ciudad */}
      <form
        action="/modelos"
        method="GET"
        className="hidden border-b border-border bg-white px-6 py-5 md:block"
      >
        <input type="hidden" name="gender" value={currentGender} />
        <div className="mx-auto flex max-w-6xl items-end gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-dark/30" />
            <Input
              name="q"
              autoComplete="off"
              placeholder={searchPlaceholder}
              className="w-full pl-9"
            />
          </div>
          <Select name="city" defaultValue="" aria-label="Ciudad" className="w-48">
            <option value="">Todas las ciudades</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Button type="submit">Buscar</Button>
        </div>
      </form>

      {/* Mobile: input de búsqueda (Enter envía) + botón que abre el drawer de filtros. */}
      <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-4 md:hidden">
        <form action="/modelos" method="GET" className="relative flex-1">
          <input type="hidden" name="gender" value={currentGender} />
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-dark/30" />
          <Input
            name="q"
            autoComplete="off"
            placeholder="Buscar…"
            className="w-full pl-9"
            aria-label="Buscar"
          />
        </form>
        <FilterDrawer options={options} />
      </div>
    </>
  );
}
