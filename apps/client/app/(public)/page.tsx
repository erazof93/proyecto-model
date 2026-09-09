import { SearchFilters } from "@/components/modelos/SearchFilters";
import { FeaturedCarousel } from "@/components/modelos/FeaturedCarousel";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { getFeaturedModelos, getFilterOptions, getModelos } from "@/lib/db/queries";

// Lee datos en vivo de Postgres en cada request: sin esto, Next.js
// prerenderiza esta página una sola vez en build time y sirve esa foto
// fija de la BD hasta el próximo build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // El carrusel sale de `featured_listings` type=BANNER. "Modelos recomendadas"
  // muestra TODAS las modelos visibles, con las que tienen una destacada TOP
  // vigente primero (badge VIP). La home es pública y no debe caer entera si la
  // BD falla puntualmente: degradamos a listas vacías y dejamos rastro en el log.
  const [banner, top, recomendadas, filterOptions] = await Promise.all([
    getFeaturedModelos({ type: "BANNER" }).catch((err) => {
      console.error("[home] getFeaturedModelos(BANNER) falló:", err);
      return [];
    }),
    getFeaturedModelos({ type: "TOP" }).catch((err) => {
      console.error("[home] getFeaturedModelos(TOP) falló:", err);
      return [];
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

  return (
    <>
      <SearchFilters options={filterOptions} />
      <section className="mx-auto max-w-6xl px-6 py-8">
        <FeaturedCarousel models={banner} />
      </section>
      {recomendadas.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-dark">Modelos recomendadas</h2>
          <ModelGrid models={recomendadas.data} featuredIds={topIds} className="xl:grid-cols-5" />
        </section>
      )}
    </>
  );
}
