import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function TableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-card border border-stroke bg-surface", className)}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-canvas-soft text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
      {children}
    </thead>
  );
}

export function TableHeaderCell({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("whitespace-nowrap border-b border-stroke px-4 py-3 text-left font-semibold", className)}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("border-b border-stroke px-4 py-3.5 text-ink-secondary last:border-b-0", className)}
      {...props}
    >
      {children}
    </td>
  );
}
