import { SearchFilters } from "@/components/modelos/SearchFilters";
import { FeaturedCarousel } from "@/components/modelos/FeaturedCarousel";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { getFeaturedModelos, getModelos } from "@/lib/db/queries";

// Lee datos en vivo de Postgres en cada request: sin esto, Next.js
// prerenderiza esta página una sola vez en build time y sirve esa foto
// fija de la BD hasta el próximo build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, recomendadas] = await Promise.all([
    getFeaturedModelos(),
    getModelos({ pageSize: 5 }),
  ]);

  return (
    <>
      <SearchFilters />
      <section className="mx-auto max-w-6xl px-6 py-8">
        <FeaturedCarousel models={featured} />
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-6 text-2xl font-bold text-dark">Modelos recomendadas</h2>
        <ModelGrid models={recomendadas.data} className="xl:grid-cols-5" />
      </section>
    </>
  );
}
