import Editor, { type BeforeMount } from "@monaco-editor/react";
import { useCallback } from "react";
import { Button } from "../ui/Button";
import { SelectField } from "../ui/Field";

const LANG_MAP: Record<string, string> = {
  javascript: "javascript", typescript: "typescript", python: "python", python3: "python",
  cpp: "cpp", c: "c", java: "java", go: "go", rust: "rust", kotlin: "kotlin",
  swift: "swift", csharp: "csharp", ruby: "ruby", php: "php", scala: "scala", dart: "dart",
};

const FONT_STACK = "'JetBrainsMono Nerd Font', 'JetBrainsMono NF', 'JetBrains Mono', 'Fira Code', monospace";

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
  // Register matching editor themes so Monaco inherits the page palette instead
  // of falling back to the stock vs-dark/light scales.
  const beforeMount = useCallback<BeforeMount>((monaco) => {
    monaco.editor.defineTheme("runic-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a6a76", fontStyle: "italic" },
        { token: "keyword", foreground: "8ab4ff" },
        { token: "string", foreground: "8fe3b0" },
        { token: "number", foreground: "f2b544" },
        { token: "type", foreground: "67d5e8" },
        { token: "function", foreground: "c9a6ff" },
      ],
      colors: {
        "editor.background": "#0b0b0e",
        "editor.foreground": "#d7d7de",
        "editorLineNumber.foreground": "#4a4a55",
        "editorLineNumber.activeForeground": "#9a9aa6",
        "editor.lineHighlightBackground": "#14141a",
        "editor.selectionBackground": "#2f6bff44",
        "editorCursor.foreground": "#4b80ff",
        "editorIndentGuide.background1": "#1e1e26",
        "editorGutter.background": "#0b0b0e",
        "editorWidget.background": "#111114",
        "editorWidget.border": "#24242b",
      },
    });

    monaco.editor.defineTheme("runic-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "74747f", fontStyle: "italic" },
        { token: "keyword", foreground: "1c47c4" },
        { token: "string", foreground: "128a5c" },
        { token: "number", foreground: "a86a00" },
        { token: "type", foreground: "0b74c4" },
        { token: "function", foreground: "7b3fd4" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#101014",
        "editorLineNumber.foreground": "#a8a8b4",
        "editorLineNumber.activeForeground": "#4c4c58",
        "editor.lineHighlightBackground": "#f3f3f6",
        "editorCursor.foreground": "#2456e6",
      },
    });
  }, []);

  return (
    <div className="flex min-h-[220px] min-w-0 flex-1 flex-col overflow-hidden rounded-card border border-stroke bg-surface">
      <div className="flex shrink-0 items-center gap-2 border-b border-stroke px-3 py-2">
        <SelectField
          className="h-8 w-auto min-w-32 rounded-full bg-surface px-3 text-xs"
          aria-label="Language"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </SelectField>
        <div className="flex-1" />
        <Button size="sm" onClick={onRun} disabled={running}>
          {running ? "Running…" : "Run"}
        </Button>
        <Button variant="primary" size="sm" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language={LANG_MAP[language] || "javascript"}
          value={code}
          onChange={(v) => onCodeChange(v || "")}
          theme={theme === "dark" ? "runic-dark" : "runic-light"}
          beforeMount={beforeMount}
          options={{
            fontFamily: FONT_STACK,
            fontSize: 13.5,
            lineHeight: 1.75,
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 14, bottom: 14 },
            renderLineHighlight: "line",
            renderWhitespace: "selection",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
