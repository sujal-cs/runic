import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
};

export function Card({ padding = "md", className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-card border border-stroke bg-surface", paddingClasses[padding], className)}
      {...props}
    />
  );
}
