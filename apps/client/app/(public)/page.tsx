import Link from "next/link";
import { SearchFilters } from "@/components/modelos/SearchFilters";
import { FeaturedCarousel } from "@/components/modelos/FeaturedCarousel";
import { ModelCarousel } from "@/components/modelos/ModelCarousel";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { Pagination } from "@/components/modelos/Pagination";
import {
  getFeaturedModelos,
  getFilterOptions,
  getModelos,
  getVipCarousel,
} from "@/lib/db/queries";

// Lee datos en vivo de Postgres en cada request: sin esto, Next.js
// prerenderiza esta página una sola vez en build time y sirve esa foto
// fija de la BD hasta el próximo build.
export const dynamic = "force-dynamic";

const NUEVAS_EN_HOME = 8;
const RECOMENDADAS_POR_PAGINA = 20;

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  // `?page=N` pagina la grid "Modelos recomendadas" (20 por página).
  const recomPage = Number(params.page) || 1;
  // - Carrusel superior = `featured_listings` type=BANNER.
  // - "TOP Destacadas" = hasta 8 VIP (type=TOP) elegidas al azar, rotan cada hora.
  // - "Nuevas integrantes" = las 8 modelos más recientes.
  // - "Modelos recomendadas" = TODAS las visibles, TOP primero, paginado de 20.
  // La home es pública: si la BD falla degradamos a listas vacías y lo logueamos.
  const [banner, top, vips, nuevas, recomendadas, filterOptions] = await Promise.all([
    getFeaturedModelos({ type: "BANNER" }).catch((err) => {
      console.error("[home] getFeaturedModelos(BANNER) falló:", err);
      return [];
    }),
    getFeaturedModelos({ type: "TOP" }).catch((err) => {
      console.error("[home] getFeaturedModelos(TOP) falló:", err);
      return [];
    }),
    getVipCarousel(8).catch((err) => {
      console.error("[home] getVipCarousel falló:", err);
      return [];
    }),
    getModelos({ pageSize: NUEVAS_EN_HOME, isNew: true }).catch((err) => {
      console.error("[home] getModelos(nuevas) falló:", err);
      return { data: [], page: 1, pageSize: NUEVAS_EN_HOME, total: 0, totalPages: 0 };
    }),
    getModelos({
      pageSize: RECOMENDADAS_POR_PAGINA,
      page: recomPage,
      featuredFirst: true,
    }).catch((err) => {
      console.error("[home] getModelos falló:", err);
      return {
        data: [],
        page: recomPage,
        pageSize: RECOMENDADAS_POR_PAGINA,
        total: 0,
        totalPages: 1,
      };
    }),
    getFilterOptions().catch((err) => {
      console.error("[home] getFilterOptions falló:", err);
      return { cities: [], genders: [], services: [] };
    }),
  ]);

  const topIds = new Set(top.map((m) => m.id));
  const hayMasNuevas = nuevas.total > nuevas.data.length;
  // Los carruseles son Client Components: aplanamos las instancias de entity.
  const nuevasPlain = nuevas.data.map((m) => JSON.parse(JSON.stringify(m)) as typeof m);

  return (
    <>
      <SearchFilters options={filterOptions} />
      <section className="mx-auto max-w-6xl px-6 py-8">
        <FeaturedCarousel models={banner} />
      </section>

      {vips.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-dark">TOP Destacadas</h2>
            <Link
              href="/modelos?type=TOP"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todas las VIP &rarr;
            </Link>
          </div>
          <ModelCarousel models={vips} featuredIds={vips.map((m) => m.id)} autoplay />
          <p className="mt-2 text-center text-xs text-dark/40">
            La selección de VIP rota cada hora.
          </p>
        </section>
      )}

      {nuevas.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-dark">Nuevas integrantes</h2>
            {hayMasNuevas && (
              <Link href="/modelos" className="text-sm font-medium text-primary hover:underline">
                Ver todas &rarr;
              </Link>
            )}
          </div>
          <ModelCarousel models={nuevasPlain} featuredIds={[...topIds]} />
        </section>
      )}

      {recomendadas.data.length > 0 && (
        <section id="recomendadas" className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-dark">Modelos recomendadas</h2>
          <ModelGrid models={recomendadas.data} featuredIds={topIds} />
          {recomendadas.totalPages > 1 && (
            <Pagination
              page={recomendadas.page}
              totalPages={recomendadas.totalPages}
              searchParams={params}
              basePath="/"
              hash="#recomendadas"
            />
          )}
        </section>
      )}
    </>
  );
}
