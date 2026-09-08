import { SearchFilters } from "@/components/modelos/SearchFilters";
import { FeaturedCarousel } from "@/components/modelos/FeaturedCarousel";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { getFeaturedModelos, getFilterOptions } from "@/lib/db/queries";

// Lee datos en vivo de Postgres en cada request: sin esto, Next.js
// prerenderiza esta página una sola vez en build time y sirve esa foto
// fija de la BD hasta el próximo build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Todo el contenido del home sale de `featured_listings` (lo controla el
  // admin): "BANNER" alimenta el carrusel y "TOP" el grid de recomendadas.
  // La home es pública y no debe caer entera si la BD falla puntualmente:
  // degradamos a listas vacías y dejamos rastro en el log.
  const [banner, top, filterOptions] = await Promise.all([
    getFeaturedModelos({ type: "BANNER" }).catch((err) => {
      console.error("[home] getFeaturedModelos(BANNER) falló:", err);
      return [];
    }),
    getFeaturedModelos({ type: "TOP" }).catch((err) => {
      console.error("[home] getFeaturedModelos(TOP) falló:", err);
      return [];
    }),
    getFilterOptions().catch((err) => {
      console.error("[home] getFilterOptions falló:", err);
      return { cities: [], genders: [], services: [] };
    }),
  ]);

  return (
    <>
      <SearchFilters options={filterOptions} />
      <section className="mx-auto max-w-6xl px-6 py-8">
        <FeaturedCarousel models={banner} />
      </section>
      {top.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-dark">Modelos recomendadas</h2>
          <ModelGrid models={top} className="xl:grid-cols-5" />
        </section>
      )}
    </>
  );
}
