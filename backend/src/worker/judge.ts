import { env } from "../config/env.js";
import { resolveLanguage, SOURCE_DIR, type LanguageDefinition } from "../shared/languages.js";
import type { JudgeResult, JudgeStatus, TestResult } from "../shared/verdicts.js";
import { runContainer, type ContainerFile, type ContainerResult } from "./docker.js";

// Test-case evaluation. Everything here produces container specs; the actual
// untrusted process only ever exists inside `runContainer`.

export type SubmissionTestCase = { input: string; expected: string | null };

// Only identifier-shaped function names are interpolated into the generated
// driver. Snippets come from the database, but keeping the check local means a
// bad row cannot turn into injected code.
const FUNCTION_NAME = /^[A-Za-z_$][\w$]*$/;

const MEMORY_SIGNATURES =
  /JavaScript heap out of memory|MemoryError|std::bad_alloc|bad_alloc|Cannot allocate memory|Out of memory|Killed/i;

const RESULT_MARKER = "__CODEFORGE_RESULT__:";

function extractFunctionName(snippet: string, definition: LanguageDefinition): string | null {
  if (!snippet) return null;
  const patterns =
    definition.runtime === "python"
      ? [/def\s+(\w+)\s*\(/]
      : [
          /function\s+(\w+)\s*\(/,
          /var\s+(\w+)\s*=/,
          /let\s+(\w+)\s*=/,
          /const\s+(\w+)\s*=/,
          /(\w+)\s*\([^)]*\)\s*\{/,
        ];
  for (const pattern of patterns) {
    const match = snippet.match(pattern);
    if (match && FUNCTION_NAME.test(match[1])) return match[1];
  }
  return null;
}

function parseExpected(raw: string | null): unknown {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function parseJudgeOutput(stdout: string): { actual: unknown; found: boolean } {
  const index = stdout.lastIndexOf(RESULT_MARKER);
  if (index === -1) return { actual: null, found: false };
  try {
    return { actual: JSON.parse(stdout.slice(index + RESULT_MARKER.length)), found: true };
  } catch {
    return { actual: null, found: false };
  }
}

/** Map a container outcome onto a per-test status. */
function classify(run: ContainerResult): string {
  if (run.setupError) return "Judge Unavailable";
  if (run.outputLimitExceeded) return "Output Limit Exceeded";
  if (run.timedOut) return "Time Limit Exceeded";
  if (run.oomKilled) return "Memory Limit Exceeded";
  if (MEMORY_SIGNATURES.test(run.stderr)) return "Memory Limit Exceeded";
  // SIGKILL without our own timeout almost always means the OOM killer.
  if (run.exitCode === 137) return "Memory Limit Exceeded";
  if (run.exitCode !== 0) return "Runtime Error";
  return "OK";
}

function recordFromRun(
  testCase: SubmissionTestCase,
  run: ContainerResult,
  outcome: string,
  parsed: { actual: unknown; found: boolean },
): TestResult {
  const expected = parseExpected(testCase.expected);
  let status = outcome;

  if (
    status === "OK" &&
    expected !== null &&
    (!parsed.found || !deepEqual(parsed.actual, expected))
  ) {
    status = "Wrong Answer";
  }

  const markerIndex = run.stdout.lastIndexOf(RESULT_MARKER);
  const visibleStdout = markerIndex >= 0 ? run.stdout.slice(0, markerIndex) : run.stdout;

  return {
    passed: status === "OK",
    status,
    input: testCase.input,
    expected: testCase.expected,
    actual: parsed.found ? JSON.stringify(parsed.actual) : null,
    stdout: visibleStdout,
    stderr: run.stderr || run.setupError || "",
    runtimeMs: run.runtimeMs,
  };
}

// Hard failures are more actionable than a wrong answer, so they win when a
// submission fails several test cases for different reasons.
const SEVERITY: JudgeStatus[] = [
  "Judge Unavailable",
  "Judge Error",
  "Compilation Error",
  "Memory Limit Exceeded",
  "Time Limit Exceeded",
  "Output Limit Exceeded",
  "Runtime Error",
  "Wrong Answer",
  "Accepted",
];

function summarize(results: TestResult[]): JudgeStatus {
  for (const status of SEVERITY) {
    if (results.some((result) => result.status === status)) return status;
  }
  return "Accepted";
}

function parseArgs(testCase: SubmissionTestCase): unknown[] {
  return testCase.input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return line;
      }
    });
}

// Python inputs are Python literals, so they are left raw and evaluated with
// `ast.literal_eval` inside the container.
function rawArgLines(testCase: SubmissionTestCase): string[] {
  return testCase.input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function javascriptFiles(code: string, testCase: SubmissionTestCase, fnName: string): Record<string, ContainerFile> {
  const args = parseArgs(testCase);
  const script = `${code}

const __args = ${JSON.stringify(args)};
let __result;
try {
  __result = ${fnName}(...__args);
} catch (e) {
  console.error(e && e.stack ? e.stack : String(e));
  process.exit(1);
}
process.stdout.write(${JSON.stringify(RESULT_MARKER)} + JSON.stringify(__result === undefined ? null : __result));
`;
  return { "main.js": { content: script } };
}

function pythonFiles(code: string, testCase: SubmissionTestCase, fnName: string): Record<string, ContainerFile> {
  const driver = `import ast
import json
import sys

import solution

_fn_name = ${JSON.stringify(fnName)}
if hasattr(solution, "Solution"):
    _fn = getattr(solution.Solution(), _fn_name)
else:
    _fn = getattr(solution, _fn_name)

_args = [ast.literal_eval(x) for x in ${JSON.stringify(rawArgLines(testCase))}]
try:
    _result = _fn(*_args)
except Exception as exc:
    sys.stderr.write(str(exc))
    sys.exit(1)
sys.stdout.write(${JSON.stringify(RESULT_MARKER)} + json.dumps(_result))
`;
  return { "solution.py": { content: code }, "run.py": { content: driver } };
}

function looksLikeCompilationError(run: ContainerResult): boolean {
  return /SyntaxError|IndentationError|TabError/.test(run.stderr);
}

async function runTestCase(
  definition: LanguageDefinition,
  files: Record<string, ContainerFile>,
  entrypoint: string,
  jobId: string,
): Promise<ContainerResult> {
  return runContainer({
    image: definition.image,
    command: definition.run(entrypoint, ""),
    files,
    memoryMb: definition.memoryMb,
    cpuLimit: definition.cpuLimit,
    pidsLimit: definition.pidsLimit,
    timeoutMs: env.judge.timeoutMs,
    maxOutputBytes: env.judge.maxOutputBytes,
    tmpfsMb: env.judge.tmpfsMb,
    jobId,
  });
}

export async function evaluateSubmission(
  language: string,
  code: string,
  problem: any,
  jobId: string,
): Promise<JudgeResult> {
  const definition = resolveLanguage(language);
  if (!definition || !definition.judgeable) {
    return {
      status: "Unsupported Language",
      results: [],
      runtimeMs: 0,
      message: `Language is not supported by the judge: ${language}`,
    };
  }

  const testCases: SubmissionTestCase[] = Array.isArray(problem.testCases)
    ? problem.testCases
    : Array.isArray(problem.test_cases)
      ? problem.test_cases
      : [];

  if (testCases.length === 0) {
    return {
      status: "Judge Error",
      results: [],
      runtimeMs: 0,
      message: "This problem has no evaluation test cases",
    };
  }

  const snippets = problem.codeSnippets || problem.code_snippets || {};
  const keys = [language, language.toLowerCase(), definition.id, ...definition.aliases];
  const snippet =
    keys.map((key) => snippets[key]).find((value) => typeof value === "string" && value.length > 0) ?? "";
  const functionName = extractFunctionName(snippet, definition);

  if (!functionName) {
    return {
      status: "Judge Error",
      results: [],
      runtimeMs: 0,
      message: "Could not determine the entry point for this language",
    };
  }

  const results: TestResult[] = [];
  let totalMs = 0;

  for (const testCase of testCases) {
    const files =
      definition.runtime === "python"
        ? pythonFiles(code, testCase, functionName)
        : javascriptFiles(code, testCase, functionName);
    const entrypoint =
      definition.runtime === "python" ? `${SOURCE_DIR}/run.py` : `${SOURCE_DIR}/main.js`;

    const run = await runTestCase(definition, files, entrypoint, jobId);
    totalMs += run.runtimeMs;

    const outcome = classify(run);
    const parsed = parseJudgeOutput(run.stdout);
    const record = recordFromRun(testCase, run, outcome, parsed);

    // A syntax error aborts before the user's function is ever called; report
    // it as a compilation failure rather than a runtime crash.
    if (record.status === "Runtime Error" && looksLikeCompilationError(run)) {
      record.status = "Compilation Error";
      record.passed = false;
    }

    results.push(record);

    // Deterministic failures stop the loop: repeating them for the remaining
    // test cases only burns the same timeout/compiler run again.
    if (
      record.status === "Compilation Error" ||
      outcome === "Time Limit Exceeded" ||
      outcome === "Memory Limit Exceeded" ||
      outcome === "Output Limit Exceeded" ||
      outcome === "Judge Unavailable"
    ) {
      break;
    }
  }

  const status = summarize(results);
  const unavailable = results.find((result) => result.status === "Judge Unavailable");
  const message = unavailable?.stderr;

  return {
    status,
    results,
    runtimeMs: totalMs,
    ...(message ? { message } : {}),
  };
}
