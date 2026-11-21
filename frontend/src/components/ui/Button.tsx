import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-brand text-white hover:bg-brand-hover",
  secondary: "border-stroke-strong bg-surface-muted text-ink hover:bg-surface-raised",
  ghost: "border-transparent bg-transparent text-ink-secondary hover:bg-surface-muted hover:text-ink",
  danger: "border-transparent bg-danger/10 text-danger hover:bg-danger/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function buttonClasses(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

interface LinkButtonProps extends Omit<LinkProps, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function LinkButton({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: LinkButtonProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
