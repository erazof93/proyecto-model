import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, rows = 4, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-dark">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
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
Textarea.displayName = "Textarea";
