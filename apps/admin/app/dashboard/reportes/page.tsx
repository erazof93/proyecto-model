import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { BarChart } from "@/components/admin/BarChart";
import { getAnalyticsData, getRevenueAnalytics, getVerificationStats } from "@/lib/db/admin-queries";

export const dynamic = "force-dynamic";

const genderLabel: Record<string, string> = { WOMAN: "Mujer", MAN: "Hombre", TRANSGENDER: "Trans" };

export default async function ReportesPage() {
  const [analytics, revenue, verification] = await Promise.all([
    getAnalyticsData(),
    getRevenueAnalytics(),
    getVerificationStats(),
  ]);

  const genderData = analytics.gender.map((g) => ({
    label: genderLabel[g.gender] ?? g.gender,
    value: g.count,
  }));
  const ratingData = analytics.ratings.map((r) => ({ label: `${r.rating}★`, value: r.count }));
  const featuredData = analytics.featuredTypes.map((f) => ({ label: f.type, value: f.count }));
  const activeFeaturedTotal = analytics.featuredTypes.reduce((sum, f) => sum + f.count, 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Modelos nuevas"
          value={analytics.newModels7d}
          subtitle="Últimos 7 días"
        />
        <AnalyticsCard
          title="Reseñas nuevas"
          value={analytics.newReviews7d}
          subtitle="Últimos 7 días"
        />
        <AnalyticsCard
          title="Verificadas"
          value={`${verification.verified}/${verification.total}`}
          subtitle={`${verification.verificationRate}% verificado`}
        />
        <AnalyticsCard
          title="Destacados activos"
          value={activeFeaturedTotal}
          subtitle={`S/ ${totalRevenue.toFixed(2)} recaudado`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BarChart title="Modelos por género" data={genderData} unit="modelos" />
        <BarChart title="Reseñas por rating" data={ratingData} unit="reseñas" />
        <BarChart title="Destacados por tipo" data={featuredData} unit="activos" />
      </div>

      <div className="rounded-md bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 text-lg font-bold text-dark">Modelos más reseñadas</h2>
        {analytics.topModels.length === 0 ? (
          <p className="text-sm text-dark/40">Sin datos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-light_bg text-xs font-semibold uppercase tracking-wide text-dark/50">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Reseñas</th>
                  <th className="px-4 py-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analytics.topModels.map((model) => (
                  <tr key={model.id}>
                    <td className="px-4 py-3 font-medium text-dark">{model.name}</td>
                    <td className="px-4 py-3 text-dark/70">{model.reviewCount}</td>
                    <td className="px-4 py-3 text-dark/70">
                      {model.avgRating !== null ? `${model.avgRating.toFixed(1)}★` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {revenue.length > 0 && (
        <div className="rounded-md bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 text-lg font-bold text-dark">Ingresos por destacados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-light_bg text-xs font-semibold uppercase tracking-wide text-dark/50">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Ingresos</th>
                  <th className="px-4 py-3">Destacados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {revenue.map((row) => (
                  <tr key={row.date}>
                    <td className="px-4 py-3 text-dark/70">
                      {new Date(row.date).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-dark">
                      S/ {row.revenue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-dark/70">{row.listingsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
