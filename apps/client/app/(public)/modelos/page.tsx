import { FilterSidebar } from "@/components/modelos/FilterSidebar";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { Pagination } from "@/components/modelos/Pagination";
import { Logo } from "@/components/ui/Logo";
import { getFeaturedModelos, getFilterOptions, getModelos } from "@/lib/db/queries";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function ModelosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  // El grid "Modelos Top" es una ubicación promocionada, no un resultado de
  // búsqueda: solo tiene sentido en la primera página y sin filtros aplicados.
  const hasFilters = Boolean(params.gender || params.city || params.service || params.q);
  const showTop = page <= 1 && !hasFilters;

  const [result, filterOptions, topFeatured] = await Promise.all([
    getModelos({
      gender: params.gender,
      city: params.city,
      service: params.service,
      search: params.q,
      page,
    }).catch((err) => {
      // El listado público no debe caer entero si la BD falla puntualmente.
      console.error("[modelos] getModelos falló:", err);
      return { data: [], page, pageSize: 20, total: 0, totalPages: 0 };
    }),
    getFilterOptions().catch((err) => {
      console.error("[modelos] getFilterOptions falló:", err);
      return { cities: [], genders: [], services: [] };
    }),
    showTop
      ? getFeaturedModelos({ type: "TOP" }).catch((err) => {
          console.error("[modelos] getFeaturedModelos(TOP) falló:", err);
          return [];
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <Logo href="/" />
          <p className="text-sm text-dark/40">Listado</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        <FilterSidebar
          current={{ gender: params.gender, city: params.city, service: params.service }}
          options={filterOptions}
        />
        <div className="flex-1 px-6 py-6">
          {topFeatured.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-bold text-dark">Modelos Top</h2>
              <ModelGrid models={topFeatured} />
            </section>
          )}
          <ModelGrid models={result.data} />
          <Pagination page={result.page} totalPages={result.totalPages} searchParams={params} />
        </div>
      </div>
    </>
  );
}
