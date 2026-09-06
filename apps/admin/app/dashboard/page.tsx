import { BarChart3 } from "lucide-react";
import { getAdminStats } from "@/lib/db/admin-queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const pending = stats.totalModelos - stats.verifiedModelos;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-gradient-to-br from-primary to-accent p-6 text-center text-white">
          <p className="text-3xl font-bold">{stats.verifiedModelos}</p>
          <p className="mt-1 text-sm opacity-90">Modelos verificadas</p>
        </div>
        <div className="rounded-md bg-warning-light p-6 text-center text-warning-dark">
          <p className="text-3xl font-bold">{pending}</p>
          <p className="mt-1 text-sm">Pendientes verificación</p>
        </div>
        <div className="rounded-md bg-success-light p-6 text-center text-success-dark">
          <p className="text-3xl font-bold">{stats.activeFeatured}</p>
          <p className="mt-1 text-sm">Featured activos</p>
        </div>
        <div className="rounded-md bg-danger-light p-6 text-center text-danger-dark">
          <p className="text-3xl font-bold">
            {stats.totalReviews}
            {stats.totalReviews > 0 && <span className="text-lg"> ({stats.avgRating}★)</span>}
          </p>
          <p className="mt-1 text-sm">Reseñas</p>
        </div>
      </div>
      <div className="flex h-64 items-center justify-center rounded-md bg-light_bg text-dark/50">
        <BarChart3 className="mr-2 h-5 w-5" /> Gráfico: Ingresos últimos 30 días
      </div>
    </div>
  );
}
