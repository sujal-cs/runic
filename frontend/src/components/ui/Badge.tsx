import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type BadgeVariant = "neutral" | "easy" | "medium" | "hard";

const variants: Record<BadgeVariant, string> = {
  neutral: "border-stroke bg-surface-raised text-ink-secondary",
  easy: "border-success/30 bg-success/10 text-success",
  medium: "border-warning/30 bg-warning/10 text-warning",
  hard: "border-danger/30 bg-danger/10 text-danger",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
