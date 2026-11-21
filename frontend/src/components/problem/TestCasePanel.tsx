interface TestCase { input: string; expected: string | null; }
interface Result { passed: boolean; status: string; stdout?: string; stderr?: string; runtimeMs: number; expected?: string | null; actual?: string | null; }

interface Props {
  testCases: TestCase[];
  results: Result[];
  selectedCase: number;
  onSelect: (i: number) => void;
  summary?: string;
}

export default function TestCasePanel({ testCases, results, selectedCase, onSelect, summary }: Props) {
  if (testCases.length === 0) {
    return (
      <div className="flex h-[36%] min-h-[180px] shrink-0 items-center justify-center rounded-card border border-stroke bg-surface p-4 text-sm text-ink-subtle">
        No test cases available.
      </div>
    );
  }

  const selectedResult = results[selectedCase];
  const active = testCases[selectedCase];

  return (
    <div className="flex h-[36%] min-h-[180px] min-w-0 shrink-0 flex-col overflow-hidden rounded-card border border-stroke bg-surface">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stroke px-4 py-3">
        <h3 className="font-heading text-sm font-bold text-ink">Test cases</h3>
        {summary && <span className="max-w-[65%] truncate text-xs text-ink-subtle">{summary}</span>}
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-stroke px-3 py-2" role="tablist" aria-label="Test cases">
        {testCases.map((_, i) => {
          const r = results[i];
          return (
            <button
              key={i}
              role="tab"
              aria-selected={selectedCase === i}
              className={`shrink-0 rounded-control px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCase === i
                  ? "bg-brand/10 text-brand"
                  : "text-ink-subtle hover:bg-surface-muted hover:text-ink"
              }`}
              onClick={() => onSelect(i)}
            >
              Case {i + 1}
              {r != null ? (r.passed ? " ✓" : " ✗") : ""}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">Input</div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-control bg-surface-muted p-2.5 font-code text-xs leading-relaxed text-ink-secondary">{active?.input}</pre>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">Expected output</div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-control bg-surface-muted p-2.5 font-code text-xs leading-relaxed text-ink-secondary">{active?.expected ?? "—"}</pre>
        </div>

        {selectedResult && (
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">Your output</div>
            <pre className={`overflow-x-auto whitespace-pre-wrap break-words rounded-control bg-surface-muted p-2.5 font-code text-xs leading-relaxed text-ink-secondary${selectedResult.stderr ? " border border-danger/30" : ""}`}>
              {selectedResult.stdout && selectedResult.stdout.trim().length > 0
                ? selectedResult.stdout
                : "No output produced."}
            </pre>
            {selectedResult.stderr && <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-control border border-danger/30 bg-danger/10 p-2.5 font-code text-xs leading-relaxed text-danger">{selectedResult.stderr}</pre>}
            {!selectedResult.passed && selectedResult.status === "Wrong Answer" && (
              <div className="mt-2 grid gap-2 text-xs text-ink-secondary sm:grid-cols-2">
                <span className="min-w-0 break-words">Expected <b className="font-code text-ink">{selectedResult.expected ?? "—"}</b></span>
                <span className="min-w-0 break-words">Actual <b className="font-code text-ink">{selectedResult.actual ?? "(empty)"}</b></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
