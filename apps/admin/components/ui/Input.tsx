import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => (
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
          "rounded-md border border-border bg-light_bg px-4 py-2.5 text-sm text-dark placeholder:text-dark/40",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";
