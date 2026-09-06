import { FilterSidebar } from "@/components/modelos/FilterSidebar";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { Pagination } from "@/components/modelos/Pagination";
import { Logo } from "@/components/ui/Logo";
import { getModelos } from "@/lib/db/queries";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function ModelosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const result = await getModelos({
    gender: params.gender,
    city: params.city,
    service: params.service,
    search: params.q,
    page,
  });

  return (
    <>
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto max-w-6xl">
          <Logo href="/" />
          <p className="text-sm text-dark/40">Listado</p>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        <FilterSidebar current={{ gender: params.gender, city: params.city, service: params.service }} />
        <div className="flex-1 px-6 py-6">
          <ModelGrid models={result.data} />
          <Pagination page={result.page} totalPages={result.totalPages} searchParams={params} />
        </div>
      </div>
    </>
  );
}
