import Link from "next/link";
import { Flower2 } from "lucide-react";
import { cn } from "@/lib/cn";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 text-2xl font-bold text-primary", className)}
    >
      <Flower2 className="h-6 w-6" />
      Models
    </Link>
  );
}
