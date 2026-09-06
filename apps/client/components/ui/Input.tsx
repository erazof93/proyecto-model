import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-dark">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "rounded-md border border-border bg-light_bg px-4 py-3 text-sm text-dark placeholder:text-dark/40",
            "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
            error && "border-danger focus:ring-danger/30 focus:border-danger",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-dark">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
