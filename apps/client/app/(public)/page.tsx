import Link from "next/link";
import { SearchFilters } from "@/components/modelos/SearchFilters";
import { FeaturedCarousel } from "@/components/modelos/FeaturedCarousel";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { NewModelsCarousel } from "@/components/modelos/NewModelsCarousel";
import { getFeaturedModelos, getFilterOptions, getModelos } from "@/lib/db/queries";

// Lee datos en vivo de Postgres en cada request: sin esto, Next.js
// prerenderiza esta página una sola vez en build time y sirve esa foto
// fija de la BD hasta el próximo build.
export const dynamic = "force-dynamic";

const NUEVAS_EN_HOME = 8;

export default async function HomePage() {
  // El carrusel sale de `featured_listings` type=BANNER. "Nuevas integrantes"
  // muestra como mucho 8 (las más recientes); en /modelos salen todas.
  // "Modelos recomendadas" muestra TODAS las visibles, TOP primero (badge VIP).
  // La home es pública: si la BD falla degradamos a listas vacías y lo logueamos.
  const [banner, top, nuevas, recomendadas, filterOptions] = await Promise.all([
    getFeaturedModelos({ type: "BANNER" }).catch((err) => {
      console.error("[home] getFeaturedModelos(BANNER) falló:", err);
      return [];
    }),
    getFeaturedModelos({ type: "TOP" }).catch((err) => {
      console.error("[home] getFeaturedModelos(TOP) falló:", err);
      return [];
    }),
    getModelos({ pageSize: NUEVAS_EN_HOME, isNew: true }).catch((err) => {
      console.error("[home] getModelos(nuevas) falló:", err);
      return { data: [], page: 1, pageSize: NUEVAS_EN_HOME, total: 0, totalPages: 0 };
    }),
    getModelos({ pageSize: 50, featuredFirst: true }).catch((err) => {
      console.error("[home] getModelos falló:", err);
      return { data: [], page: 1, pageSize: 50, total: 0, totalPages: 0 };
    }),
    getFilterOptions().catch((err) => {
      console.error("[home] getFilterOptions falló:", err);
      return { cities: [], genders: [], services: [] };
    }),
  ]);

  const topIds = new Set(top.map((m) => m.id));
  const hayMasNuevas = nuevas.total > nuevas.data.length;
  // <NewModelsCarousel> es Client Component: aplanamos las instancias de entity.
  const nuevasPlain = nuevas.data.map((m) => JSON.parse(JSON.stringify(m)) as typeof m);

  return (
    <>
      <SearchFilters options={filterOptions} />
      <section className="mx-auto max-w-6xl px-6 py-8">
        <FeaturedCarousel models={banner} />
      </section>
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
          <NewModelsCarousel models={nuevasPlain} featuredIds={[...topIds]} />
        </section>
      )}
      {recomendadas.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-dark">Modelos recomendadas</h2>
          <ModelGrid models={recomendadas.data} featuredIds={topIds} />
        </section>
      )}
    </>
  );
}
