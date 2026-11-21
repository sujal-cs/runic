import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
}

export default function FormField({ id, label, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-secondary">{label}</label>
      {children}
    </div>
  );
}
