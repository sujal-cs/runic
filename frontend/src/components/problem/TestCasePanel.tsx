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
      <div className="panel testcase-panel">
        <div className="state">No test cases available.</div>
      </div>
    );
  }

  const selectedResult = results[selectedCase];
  const active = testCases[selectedCase];

  return (
    <div className="panel testcase-panel">
      <div className="testcase-head">
        <h3>Test cases</h3>
        {summary && <span className="testcase-summary">{summary}</span>}
      </div>

      <div className="case-tabs" role="tablist" aria-label="Test cases">
        {testCases.map((_, i) => {
          const r = results[i];
          return (
            <button
              key={i}
              role="tab"
              aria-selected={selectedCase === i}
              className="case-tab"
              data-active={selectedCase === i}
              data-state={r == null ? undefined : r.passed ? "pass" : "fail"}
              onClick={() => onSelect(i)}
            >
              Case {i + 1}
              {r != null ? (r.passed ? " ✓" : " ✗") : ""}
            </button>
          );
        })}
      </div>

      <div className="case-body">
        <div className="io-group">
          <div className="io-label">Input</div>
          <div className="io-block">{active?.input}</div>
        </div>

        <div className="io-group">
          <div className="io-label">Expected output</div>
          <div className="io-block">{active?.expected ?? "—"}</div>
        </div>

        {selectedResult && (
          <div className="io-group">
            <div className="io-label">Your output</div>
            <div className={`io-block${selectedResult.stderr ? " is-error" : ""}`}>
              {selectedResult.stdout && selectedResult.stdout.trim().length > 0
                ? selectedResult.stdout
                : "No output produced."}
            </div>
            {selectedResult.stderr && <div className="io-block is-error" style={{ marginTop: 8 }}>{selectedResult.stderr}</div>}
            {!selectedResult.passed && selectedResult.status === "Wrong Answer" && (
              <div className="io-mismatch">
                <span>Expected <b>{selectedResult.expected ?? "—"}</b></span>
                <span>Actual <b>{selectedResult.actual ?? "(empty)"}</b></span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
