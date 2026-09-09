import { FilterSidebar } from "@/components/modelos/FilterSidebar";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { Pagination } from "@/components/modelos/Pagination";
import { Logo } from "@/components/ui/Logo";
import { getFilterOptions, getModelosOrdenados } from "@/lib/db/queries";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function ModelosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const isNew = params.isNew === "true";
  const type = params.type === "TOP" ? "TOP" : undefined;

  const [result, filterOptions] = await Promise.all([
    // 5 tramos de prioridad + rotación semanal en "activas"; las inactivas van
    // al final pero nunca desaparecen. `featuredIds` = tramo TOP (badge VIP).
    getModelosOrdenados({
      gender: params.gender,
      city: params.city,
      service: params.service,
      search: params.q,
      isNew,
      type,
      page,
    }).catch((err) => {
      console.error("[modelos] getModelosOrdenados falló:", err);
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
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <Logo href="/" />
          <p className="text-sm text-dark/40">Listado</p>
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
          <ModelGrid models={result.data} featuredIds={topIds} />
          <Pagination page={result.page} totalPages={result.totalPages} searchParams={params} />
        </div>
      </div>
    </>
  );
}
