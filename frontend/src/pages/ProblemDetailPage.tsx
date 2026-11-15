import { useEffect, useState } from "react";
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

  const handleSubmit = async () => {
    if (!user) {
      sessionStorage.setItem("notice", "Login required for this activity");
      navigate("/login");
      return;
    }
    if (!problem) return;
    setSubmitting(true);
    setResult(null);
    try {
      const data = await api("/api/submissions", {
        method: "POST",
        body: JSON.stringify({ problemId: problem.id, language, code }),
      });
      setResult(data);
      setSelectedCase(0);
    } catch (e: any) {
      setResult({ status: "Error", results: [], stderr: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) return <div className="card">Loading...</div>;

  const results = result?.results || [];
  const passedCount = results.filter((r: any) => r.passed).length;
  const summary = result ? `${passedCount}/${results.length} Test Cases Passed · ${result.status}` : undefined;

  return (
    <div style={{ height: "calc(100vh - 56px)", overflow: "hidden", padding: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
        <h1 style={{ display: "inline", marginLeft: 12, fontSize: 20 }}>{problem.title}</h1>
      </div>
      <div style={{ height: "calc(100% - 40px)" }}>
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
              {result?.stderr && (
                <div className="card">
                  <h3 style={{ marginTop: 0 }}>Result</h3>
                  <div className={result.status === "Accepted" ? "result-ok" : "result-fail"} style={{ fontWeight: 600, marginBottom: 8 }}>
                    {result.status}
                  </div>
                  <pre style={{ color: "var(--danger)" }}>{result.stderr}</pre>
                </div>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}