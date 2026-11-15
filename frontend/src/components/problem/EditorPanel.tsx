import Editor from "@monaco-editor/react";

const LANG_MAP: Record<string, string> = {
  javascript: "javascript", typescript: "typescript", python: "python", python3: "python",
  cpp: "cpp", c: "c", java: "java", go: "go", rust: "rust", kotlin: "kotlin",
  swift: "swift", csharp: "csharp", ruby: "ruby", php: "php", scala: "scala", dart: "dart",
};

interface Props {
  languages: string[];
  language: string;
  onLanguageChange: (l: string) => void;
  code: string;
  onCodeChange: (v: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  running: boolean;
  submitting: boolean;
  theme: string;
}

export default function EditorPanel({ languages, language, onLanguageChange, code, onCodeChange, onRun, onSubmit, running, submitting, theme }: Props) {
  return (
    <div className="card" style={{ padding: 8 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <select className="input" style={{ width: 180 }} value={language} onChange={(e) => onLanguageChange(e.target.value)}>
          {languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={onRun} disabled={running}>{running ? "Running..." : "Run"}</button>
        <button className="btn" onClick={onSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
      </div>
      <Editor
        height="420px"
        language={LANG_MAP[language] || "javascript"}
        value={code}
        onChange={(v) => onCodeChange(v || "")}
        theme={theme === "dark" ? "vs-dark" : "light"}
        options={{ fontFamily: "'JetBrainsMono Nerd Font', 'JetBrains Mono', monospace", fontSize: 14, minimap: { enabled: false } }}
      />
    </div>
  );
}
