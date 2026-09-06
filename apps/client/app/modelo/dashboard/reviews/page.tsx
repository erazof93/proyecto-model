import { notFound } from "next/navigation";
import { ReviewsStats } from "@/components/dashboard/ReviewsStats";
import { ReviewCard } from "@/components/dashboard/ReviewCard";
import { getSession } from "@/lib/auth/session";
import { getModelReviews, getModelReviewStats } from "@/lib/db/queries";

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session?.modelId) notFound();

  const [reviews, stats] = await Promise.all([
    getModelReviews(session.modelId),
    getModelReviewStats(session.modelId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-dark">Mis reseñas</h1>

      <ReviewsStats {...stats} />

      {reviews.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-dark">
            {reviews.length} reseña{reviews.length !== 1 ? "s" : ""}
          </h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
