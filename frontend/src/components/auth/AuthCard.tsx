import type { ReactNode } from "react";
import { Card } from "../ui/Card";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="mx-auto w-full max-w-[430px] py-14">
      <Card className="p-8 max-sm:p-6">
        <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
          {eyebrow}
        </span>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{description}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-ink-secondary">{footer}</p>
      </Card>
    </div>
  );
}
