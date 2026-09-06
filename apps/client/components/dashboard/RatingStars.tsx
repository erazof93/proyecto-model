import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

const sizeClasses = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function RatingStars({
  rating,
  size = "md",
}: {
  rating: number;
  size?: keyof typeof sizeClasses;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-border",
          )}
        />
      ))}
    </div>
  );
}
