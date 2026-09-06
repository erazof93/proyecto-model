import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-white shadow-sm ring-1 ring-black/5", className)}
      {...props}
    />
  );
}
