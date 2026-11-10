import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink-900 shadow-xs transition-colors",
        "placeholder:text-ink-400",
        "focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/25",
        "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-500",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
