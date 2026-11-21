import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const fieldClassName =
  "h-10 w-full min-w-0 rounded-control border border-stroke bg-surface-muted px-3 text-sm text-ink outline-none transition placeholder:text-ink-subtle focus:border-brand focus:ring-2 focus:ring-brand/20";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function TextInput({ className, ...props }: TextInputProps) {
  return <input className={cn(fieldClassName, className)} {...props} />;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function SelectField({ className, ...props }: SelectFieldProps) {
  return (
    <select
      className={cn(
        fieldClassName,
        "cursor-pointer appearance-none bg-[length:12px_12px] bg-[right_12px_center] bg-no-repeat pr-9",
        className,
      )}
      {...props}
    />
  );
}
