import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type JudgeResult = {
  status: "Accepted" | "Wrong Answer" | "Compile Error" | "Runtime Error" | "Time Limit Exceeded" | "Unsupported Language";
  results: Array<{
    passed: boolean;
    status: string;
    input: string;
    expected: string | null;
    actual: string | null;
    stdout: string;
    stderr: string;
    runtimeMs: number;
  }>;
  runtimeMs: number;
};

type TestCase = { input: string; expected: string | null };

function spawnRun(cmd: string, args: string[], cwd: string, input: string, timeoutMs: number) {
  return new Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean; ms: number }>((resolve) => {
    const start = Date.now();
    const child = spawn(cmd, args, { cwd });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut, ms: Date.now() - start });
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: stderr + err.message, exitCode: -1, timedOut, ms: Date.now() - start });
    });
    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

function extractFunctionName(snippet: string, language: string): string | null {
  if (!snippet) return null;
  const patterns =
    language === "python" || language === "python3"
      ? [/def\s+(\w+)\s*\(/]
      : [/function\s+(\w+)\s*\(/, /var\s+(\w+)\s*=/, /let\s+(\w+)\s*=/, /const\s+(\w+)\s*=/, /(\w+)\s*\([^)]*\)\s*\{/];
  for (const p of patterns) {
    const m = snippet.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseExpected(raw: string | null): any {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Genuine evaluation for JavaScript: wraps the user's function and invokes it
// with parsed arguments from each test case, comparing serialized results.
async function evaluateJavaScript(code: string, fnName: string, tests: TestCase[]): Promise<JudgeResult> {
  const results: JudgeResult["results"] = [];
  let overall = "Accepted";
  let totalMs = 0;

  for (const tc of tests) {
    const args = tc.input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return l;
        }
      });

    const dir = path.join(os.tmpdir(), "opencode-judge", randomUUID());
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "main.js");
    const script = `${code}\n\nconst __args = ${JSON.stringify(args)};\nlet __result;\ntry {\n  __result = ${fnName}(...__args);\n} catch (e) {\n  console.error(e && e.stack ? e.stack : String(e));\n  process.exit(1);\n}\nprocess.stdout.write(JSON.stringify(__result === undefined ? null : __result));\n`;
    fs.writeFileSync(file, script);

    const run = await spawnRun("node", [file], dir, "", 10000);
    totalMs += run.ms;
    fs.rmSync(dir, { recursive: true, force: true });

    let actual: any = null;
    let parsedStdout = run.stdout;
    try {
      actual = JSON.parse(run.stdout);
      parsedStdout = JSON.stringify(actual);
    } catch {
      // Keep raw stdout when it is not JSON.
    }

    const expected = parseExpected(tc.expected);
    let passed = false;
    let status = "OK";
    if (run.timedOut) status = "Time Limit Exceeded";
    else if (run.exitCode !== 0) {
      status = run.stderr.includes("SyntaxError") ? "Compile Error" : "Runtime Error";
    } else {
      passed = expected === null ? true : deepEqual(actual, expected);
      status = passed ? "OK" : "Wrong Answer";
    }

    results.push({
      passed: status === "OK",
      status,
      input: tc.input,
      expected: tc.expected,
      actual: parsedStdout || null,
      stdout: run.stdout,
      stderr: run.stderr,
      runtimeMs: run.ms,
    });

    if (status !== "OK") {
      if (status === "Compile Error" || status === "Runtime Error" || status === "Time Limit Exceeded") {
        overall = status;
      } else if (overall === "Accepted") {
        overall = "Wrong Answer";
      }
    }
  }

  if (results.some((r) => !r.passed)) {
    if (overall === "Accepted") overall = "Wrong Answer";
  }
  // If any compile/runtime error occurred, prefer that as final status.
  const hardError = results.find((r) => r.status === "Compile Error" || r.status === "Runtime Error" || r.status === "Time Limit Exceeded");
  if (hardError) overall = hardError.status;

  return { status: overall as JudgeResult["status"], results, runtimeMs: totalMs };
}

// Genuine evaluation for Python: handles both module-level functions and the
// LeetCode-style Solution class wrapper.
async function evaluatePython(code: string, fnName: string, tests: TestCase[]): Promise<JudgeResult> {
  const results: JudgeResult["results"] = [];
  let overall = "Accepted";
  let totalMs = 0;

  for (const tc of tests) {
    const args = tc.input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const dir = path.join(os.tmpdir(), "opencode-judge", randomUUID());
    fs.mkdirSync(dir, { recursive: true });
    // Write the user's code to its own module so it is imported rather than
    // exec'd from a templated string, avoiding code-injection escapes.
    fs.writeFileSync(path.join(dir, "solution.py"), code);
    const driver = `
import json, ast, sys
import solution

_fn_name = ${JSON.stringify(fnName)}
if hasattr(solution, "Solution"):
    _instance = solution.Solution()
    _fn = getattr(_instance, _fn_name)
else:
    _fn = getattr(solution, _fn_name)

_args = [ast.literal_eval(x) for x in ${JSON.stringify(args)}]
try:
    _result = _fn(*_args)
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
sys.stdout.write(json.dumps(_result))
`;
    const driverPath = path.join(dir, "run.py");
    fs.writeFileSync(driverPath, driver);

    const run = await spawnRun("python3", [driverPath], dir, "", 10000);
    totalMs += run.ms;
    fs.rmSync(dir, { recursive: true, force: true });

    let actual: any = null;
    try {
      actual = JSON.parse(run.stdout);
    } catch {
      // Keep raw stdout.
    }
    const expected = parseExpected(tc.expected);
    let status = "OK";
    if (run.timedOut) status = "Time Limit Exceeded";
    else if (run.exitCode !== 0) status = "Runtime Error";
    else {
      const passed = expected === null ? true : deepEqual(actual, expected);
      status = passed ? "OK" : "Wrong Answer";
    }

    results.push({
      passed: status === "OK",
      status,
      input: tc.input,
      expected: tc.expected,
      actual: run.stdout ? (actual !== null ? JSON.stringify(actual) : run.stdout) : null,
      stdout: run.stdout,
      stderr: run.stderr,
      runtimeMs: run.ms,
    });

    const hardError = status === "Compile Error" || status === "Runtime Error" || status === "Time Limit Exceeded";
    if (hardError) {
      overall = status;
    } else if (status === "Wrong Answer" && overall === "Accepted") {
      overall = "Wrong Answer";
    }
  }

  const hard = results.find((r) => r.status === "Compile Error" || r.status === "Runtime Error" || r.status === "Time Limit Exceeded");
  if (hard) overall = hard.status;
  else if (results.some((r) => !r.passed)) overall = "Wrong Answer";

  return { status: overall as JudgeResult["status"], results, runtimeMs: totalMs };
}

export async function evaluateSubmission(
  language: string,
  code: string,
  problem: any,
): Promise<JudgeResult> {
  const tests = Array.isArray(problem.testCases) ? problem.testCases : Array.isArray(problem.test_cases) ? problem.test_cases : [];
  const lang = language.toLowerCase();
  const snippets = problem.codeSnippets || problem.code_snippets || {};
  const snippet = snippets?.[lang] || snippets?.[language] || "";
  const fnName = extractFunctionName(snippet, lang);

  if (lang === "javascript" || lang === "typescript") {
    if (!fnName) return { status: "Runtime Error", results: [], runtimeMs: 0 };
    return evaluateJavaScript(code, fnName, tests);
  }
  if (lang === "python" || lang === "python3") {
    if (!fnName) return { status: "Runtime Error", results: [], runtimeMs: 0 };
    return evaluatePython(code, fnName, tests);
  }

  return { status: "Unsupported Language", results: [], runtimeMs: 0 };
}