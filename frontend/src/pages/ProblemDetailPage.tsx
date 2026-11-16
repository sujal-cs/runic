import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ResizableSplit from "../components/problem/ResizableSplit";
import DescriptionPanel from "../components/problem/DescriptionPanel";
import EditorPanel from "../components/problem/EditorPanel";
import TestCasePanel from "../components/problem/TestCasePanel";

interface Problem {
  id: number;
  frontend_id: string;
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  constraints: string[];
  test_cases: { input: string; expected: string | null }[];
  code_snippets: Record<string, string>;
  tags: string[];
}

// A submission is finished once the judge has produced a verdict. The worker
// reports Pending -> Processing -> final, so anything else is terminal.
const FINAL_STATUSES = new Set([
  "Accepted",
  "Wrong Answer",
  "Time Limit Exceeded",
  "Memory Limit Exceeded",
  "Runtime Error",
  "Compilation Error",
  "Output Limit Exceeded",
  "Unsupported Language",
  "Judge Unavailable",
  "Judge Error",
]);

const PENDING_STATUSES = new Set(["Pending", "Processing"]);

const POLL_INTERVAL_MS = 1200;
const POLL_ATTEMPTS = 60;

export default function ProblemDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedCase, setSelectedCase] = useState(0);
  const pollToken = useRef(0);

  useEffect(() => {
    // Invalidate any in-flight polling when the page unmounts or the problem
    // changes, so a late response cannot update a stale screen.
    return () => {
      pollToken.current += 1;
    };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    api(`/api/problems/${slug}`)
      .then((d) => {
        setProblem(d.problem);
        const snippets = d.problem.code_snippets || {};
        const langs = Object.keys(snippets);
        const initialLang = langs.includes("javascript") ? "javascript" : langs[0] || "javascript";
        setLanguage(initialLang);
        setCode(snippets[initialLang] || "");
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!problem) return;
    const snippets = problem.code_snippets || {};
    if (snippets[language]) setCode(snippets[language]);
  }, [language, problem]);

  const handleRun = async () => {
    if (!user) {
      sessionStorage.setItem("notice", "Login required for this activity");
      navigate("/login");
      return;
    }
    if (!problem) return;
    setRunning(true);
    setResult(null);
    try {
      const data = await api("/api/submissions/run-all", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, language, code }),
      });
      setResult(data);
      setSelectedCase(0);
    } catch (e: any) {
      setResult({ status: "Error", results: [], stderr: e.message });
    } finally {
      setRunning(false);
    }
  };

  // Poll a queued submission until the worker publishes a verdict. This keeps
  // results visible after a refresh or a dropped connection.
  const followSubmission = async (id: string, token: number) => {
    for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      if (pollToken.current !== token) return;

      try {
        const data = await api(`/api/submissions/${id}`);
        if (pollToken.current !== token) return;

        const submission = data.submission;
        setResult({
          status: submission.status,
          results: submission.results ?? [],
          message: submission.message,
          runtimeMs: submission.runtime_ms,
        });
        if (FINAL_STATUSES.has(submission.status)) return;
      } catch (err) {
        console.error("[problem] failed to poll submission", err);
        return;
      }
    }
    if (pollToken.current === token) {
      setResult((current: any) => ({
        ...(current ?? { results: [] }),
        message: "The judge is taking longer than expected. Refresh to check for a result.",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      sessionStorage.setItem("notice", "Login required for this activity");
      navigate("/login");
      return;
    }
    if (!problem) return;
    setSubmitting(true);
    setResult(null);
    pollToken.current += 1;
    const token = pollToken.current;

    try {
      const data = await api("/api/submissions", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, language, code }),
      });
      setResult(data);
      setSelectedCase(0);

      // The API blocks briefly for a verdict; if the worker is still busy the
      // submission is durably queued and we follow it to completion.
      if (PENDING_STATUSES.has(data.submission?.status)) {
        void followSubmission(data.submission.id, token);
      }
    } catch (e: any) {
      setResult({ status: "Error", results: [], stderr: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="workspace">
        <div className="state">Loading problem…</div>
      </div>
    );
  }

  const results = result?.results || [];
  const passedCount = results.filter((r: any) => r.passed).length;
  const summary = result
    ? results.length === 0
      ? result.status
      : `${passedCount}/${results.length} Test Cases Passed · ${result.status}`
    : undefined;

  const verdictClass =
    result?.status === "Accepted"
      ? "is-ok"
      : PENDING_STATUSES.has(result?.status)
        ? "is-pending"
        : result
          ? "is-fail"
          : "";

  return (
    <div className="workspace">
      <div className="workspace-bar">
        <button type="button" className="workspace-back" onClick={() => navigate("/problems")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Problems
        </button>
        <h1 className="workspace-title">
          {problem.frontend_id}. {problem.title}
        </h1>
        <div className="workspace-meta">
          <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
          {problem.tags.slice(0, 2).map((tag) => (
            <span className="badge" key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className="workspace-body">
        <ResizableSplit
          left={<DescriptionPanel problem={problem} />}
          right={
            <>
              <EditorPanel
                languages={Object.keys(problem.code_snippets || {})}
                language={language}
                onLanguageChange={setLanguage}
                code={code}
                onCodeChange={setCode}
                onRun={handleRun}
                onSubmit={handleSubmit}
                running={running}
                submitting={submitting}
                theme={theme}
              />
              <TestCasePanel
                testCases={problem.test_cases || []}
                results={results}
                selectedCase={selectedCase}
                onSelect={setSelectedCase}
                summary={summary}
              />
              {result && (
                <div className={`verdict ${verdictClass}`}>
                  <span className="verdict-dot" aria-hidden="true" />
                  <div>
                    <div className="verdict-title">
                      {PENDING_STATUSES.has(result.status)
                        ? result.status === "Processing"
                          ? "Judge is running your code…"
                          : "Queued — waiting for the judge worker…"
                        : result.status}
                    </div>
                    {result.message && <div>{result.message}</div>}
                    {result.stderr && <pre>{result.stderr}</pre>}
                  </div>
                </div>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}
