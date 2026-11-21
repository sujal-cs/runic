import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
}

export default function PageHeader({ eyebrow, title, description, className = "" }: PageHeaderProps) {
  return (
    <header className={`pb-6 pt-11 ${className}`}>
      {eyebrow && (
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
          {eyebrow}
        </span>
      )}
      <h1 className="font-heading text-3xl font-bold leading-tight tracking-[-0.035em] text-ink md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-ink-secondary">
          {description}
        </p>
      )}
    </header>
  );
}
