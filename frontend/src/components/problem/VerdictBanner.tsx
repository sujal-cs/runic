import { cn } from "../../lib/cn";

type VerdictState = "success" | "pending" | "error";

interface VerdictBannerProps {
  state: VerdictState;
  title: string;
  message?: string;
  stderr?: string;
}

const stateClasses: Record<VerdictState, string> = {
  success: "border-success/30 bg-success/10 text-success",
  pending: "border-warning/30 bg-warning/10 text-warning",
  error: "border-danger/30 bg-danger/10 text-danger",
};

export default function VerdictBanner({ state, title, message, stderr }: VerdictBannerProps) {
  return (
    <div className={cn("flex shrink-0 gap-3 rounded-card border px-4 py-3 text-sm", stateClasses[state])}>
      <span className="mt-1 size-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
      <div className="min-w-0">
        <div className="font-semibold">{title}</div>
        {message && <p className="mt-1 text-xs leading-relaxed opacity-85">{message}</p>}
        {stderr && <pre className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-control bg-black/10 p-2 font-code text-xs">{stderr}</pre>}
      </div>
    </div>
  );
}
