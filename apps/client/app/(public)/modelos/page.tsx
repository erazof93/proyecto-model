import { Search } from "lucide-react";
import { FilterDrawer } from "@/components/modelos/FilterDrawer";
import { FilterSidebar } from "@/components/modelos/FilterSidebar";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { Pagination } from "@/components/modelos/Pagination";
import { Input } from "@/components/ui/Input";
import {
  getFilterOptions,
  getModelosBySearch,
  getModelosOrdenados,
} from "@/lib/db/queries";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

/** Envuelve el array plano de getModelosBySearch en la forma que espera la grid. */
function toSearchResult(rows: Awaited<ReturnType<typeof getModelosBySearch>>) {
  return {
    data: rows,
    page: 1,
    pageSize: Math.max(rows.length, 1),
    total: rows.length,
    totalPages: 1,
    featuredIds: [] as string[],
  };
}

export default async function ModelosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const isNew = params.isNew === "true";
  const type = params.type === "TOP" || params.type === "BANNER" ? params.type : undefined;
  const query = params.q?.trim();

  const [result, filterOptions] = await Promise.all([
    // Con término de búsqueda: match combinado (nombre + username + ciudad +
    // servicios), sin tramos de prioridad. Sin término: los 5 tramos + rotación
    // semanal en "activas"; las inactivas van al final pero nunca desaparecen.
    // `featuredIds` = tramo TOP (badge VIP).
    (query
      ? getModelosBySearch(query).then(toSearchResult)
      : getModelosOrdenados({
          gender: params.gender,
          city: params.city,
          service: params.service,
          isNew,
          type,
          page,
        })
    ).catch((err) => {
      console.error("[modelos] listado falló:", err);
      return { data: [], page, pageSize: 20, total: 0, totalPages: 1, featuredIds: [] };
    }),
    getFilterOptions().catch((err) => {
      console.error("[modelos] getFilterOptions falló:", err);
      return { cities: [], genders: [], services: [] };
    }),
  ]);

  const topIds = new Set(result.featuredIds);

  return (
    <>
      {/* Mobile/tablet: input de búsqueda + botón que abre el drawer de filtros.
          El sidebar completo solo aparece en desktop (lg). */}
      <div className="border-b border-border bg-white px-6 py-4 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <form action="/modelos" method="GET" className="relative flex-1">
            <input type="hidden" name="gender" value={params.gender ?? ""} />
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-dark/30" />
            <Input
              name="q"
              defaultValue={params.q ?? ""}
              autoComplete="off"
              placeholder="Buscar…"
              className="w-full pl-9"
              aria-label="Buscar"
            />
          </form>
          <FilterDrawer options={filterOptions} />
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        <FilterSidebar
          current={{
            gender: params.gender,
            city: params.city,
            service: params.service,
            isNew,
            type,
          }}
          options={filterOptions}
        />
        <div className="flex-1 px-6 py-6">
          <ModelGrid
            models={result.data}
            featuredIds={topIds}
            className={type === "BANNER" ? "grid-cols-1 md:grid-cols-2" : undefined}
            cardVariant={type === "BANNER" ? "wide" : "portrait"}
          />
          <Pagination page={result.page} totalPages={result.totalPages} searchParams={params} />
        </div>
      </div>
    </>
  );
}
