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
  if (testCases.length === 0) return <div className="card"><div style={{ color: "var(--text-subtle)" }}>No test cases available.</div></div>;
  const selectedResult = results[selectedCase];
  return (
    <div className="card" style={{ minWidth: 0 }}>
      <h3 style={{ marginTop: 0 }}>Test Cases</h3>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {testCases.map((_, i) => {
          const r = results[i];
          const color = r == null ? "var(--text-subtle)" : r.passed ? "var(--success)" : "var(--danger)";
          return (
            <button key={i} className="btn" onClick={() => onSelect(i)}
              style={{ borderColor: selectedCase === i ? "var(--brand)" : "var(--border)", color, fontWeight: selectedCase === i ? 600 : 400 }}>
              Case {i + 1}{r != null ? (r.passed ? " ✓" : " ✗") : ""}
            </button>
          );
        })}
      </div>
      {summary && <div style={{ fontSize: 13, color: "var(--text-subtle)", marginBottom: 8 }}>{summary}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-subtle)", marginBottom: 4 }}>Input</div>
          <pre style={{ margin: 0 }}>{testCases[selectedCase]?.input}</pre>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--text-subtle)", marginBottom: 4 }}>Expected Output</div>
          <pre style={{ margin: 0 }}>{testCases[selectedCase]?.expected ?? "—"}</pre>
        </div>
        {selectedResult && (
          <div>
            <div style={{ fontSize: 12, color: "var(--text-subtle)", marginBottom: 4 }}>Actual Output</div>
            <pre style={{ margin: 0 }}>
              {selectedResult.stdout && selectedResult.stdout.trim().length > 0 ? selectedResult.stdout : "No output produced."}
            </pre>
            {selectedResult.stderr && <pre style={{ color: "var(--danger)", marginTop: 8 }}>{selectedResult.stderr}</pre>}
            {!selectedResult.passed && selectedResult.status === "Wrong Answer" && (
              <div style={{ fontSize: 13, marginTop: 4 }}>
                <div>Expected: {selectedResult.expected ?? "—"}</div>
                <div>Actual: {selectedResult.actual ?? "(empty)"}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}