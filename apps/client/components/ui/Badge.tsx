import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "service" | "success" | "warning" | "danger" | "neutral" | "primary";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  service: "bg-secondary text-accent",
  success: "bg-success-light text-success-dark",
  warning: "bg-warning-light text-warning-dark",
  danger: "bg-danger-light text-danger-dark",
  neutral: "bg-light_bg text-dark/70",
  primary: "bg-gradient-to-br from-primary to-accent text-white",
};

export function Badge({ className, variant = "service", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
