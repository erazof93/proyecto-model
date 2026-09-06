import type { ReviewWithCustomer } from "@proyecto-model/types";
import { Card } from "@/components/ui/Card";
import { RatingStars } from "@/components/dashboard/RatingStars";

export function ReviewCard({ review }: { review: ReviewWithCustomer }) {
  const formattedDate = new Date(review.created_at).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p className="font-semibold text-dark">{review.customer_username ?? "Cliente anónimo"}</p>
          <p className="text-sm text-dark/40">{formattedDate}</p>
        </div>
        <RatingStars rating={review.rating} />
      </div>
      {review.comment ? (
        <p className="text-sm text-dark/70">{review.comment}</p>
      ) : (
        <p className="text-sm italic text-dark/40">Sin comentarios adicionales</p>
      )}
    </Card>
  );
}
