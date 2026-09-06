import { Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { mockReviews } from "@/lib/mock-data";

export default function ReviewsPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-dark">Reseñas</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {mockReviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-medium text-dark">Cliente verificado</p>
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="text-sm text-dark/70">{review.comment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
