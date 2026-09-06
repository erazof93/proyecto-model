import { PromoBanner } from "@/components/dashboard/PromoBanner";
import { StatCard } from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PromoBanner />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard value="60%" label="Perfil completado" />
        <StatCard value={5} label="Fotos aprobadas" />
        <StatCard value={3} label="Reseñas" />
      </div>
    </div>
  );
}
