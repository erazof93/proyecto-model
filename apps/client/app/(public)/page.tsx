import { SearchFilters } from "@/components/modelos/SearchFilters";
import { FeaturedCarousel } from "@/components/modelos/FeaturedCarousel";
import { ModelGrid } from "@/components/modelos/ModelGrid";
import { getFeaturedModelos, getModelos } from "@/lib/db/queries";

// Lee datos en vivo de Postgres en cada request: sin esto, Next.js
// prerenderiza esta página una sola vez en build time y sirve esa foto
// fija de la BD hasta el próximo build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // La home es pública y no debe caer entera si la BD falla puntualmente
  // (p.ej. límite del pooler de Supabase). Degradamos a listas vacías y
  // dejamos rastro en el log del servidor en vez de mostrar "Algo salió mal".
  const [featured, recomendadas] = await Promise.all([
    getFeaturedModelos().catch((err) => {
      console.error("[home] getFeaturedModelos falló:", err);
      return [];
    }),
    getModelos({ pageSize: 5 }).catch((err) => {
      console.error("[home] getModelos falló:", err);
      return { data: [], page: 1, pageSize: 5, total: 0, totalPages: 0 };
    }),
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
