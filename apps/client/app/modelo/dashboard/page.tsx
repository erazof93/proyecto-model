import { notFound } from "next/navigation";
import { PromoBanner } from "@/components/dashboard/PromoBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { getSession } from "@/lib/auth/session";
import { getModelDashboardSummary, getModelPhotos, getModelReviewStats } from "@/lib/db/queries";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.modelId) notFound();

  const [summary, photos, reviewStats] = await Promise.all([
    getModelDashboardSummary(session.modelId),
    getModelPhotos(session.modelId),
    getModelReviewStats(session.modelId),
  ]);
  if (!summary) notFound();

  const approvedPhotos = photos.filter((p) => p.is_verified).length;

  return (
    <div className="space-y-6">
      <PromoBanner modelName={summary.name} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard value={`${summary.onboardingPercentage}%`} label="Perfil completado" />
        <StatCard value={approvedPhotos} label="Fotos aprobadas" />
        <StatCard value={reviewStats.total} label="Reseñas" />
      </div>
    </div>
  );
}
