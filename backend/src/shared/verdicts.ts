// Shared vocabulary for execution results. The API imports these constants for
// response shaping and polling decisions; the worker imports them when it
// persists a verdict. Keeping them outside the worker guarantees the API never
// pulls execution code into its process.

export const QUEUED_STATUS = "Pending";
export const PROCESSING_STATUS = "Processing";

export const JUDGE_STATUSES = [
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
] as const;

export type JudgeStatus = (typeof JUDGE_STATUSES)[number];

export const RUN_STATUSES = [
  "OK",
  "Compilation Error",
  "Runtime Error",
  "Time Limit Exceeded",
  "Memory Limit Exceeded",
  "Output Limit Exceeded",
  "Unsupported Language",
  "Judge Unavailable",
] as const;

export type RunStatus = (typeof RUN_STATUSES)[number];

export interface TestResult {
  passed: boolean;
  status: string;
  input: string;
  expected: string | null;
  actual: string | null;
  stdout: string;
  stderr: string;
  runtimeMs: number;
  memoryKb?: number;
}

export interface JudgeResult {
  status: JudgeStatus;
  results: TestResult[];
  runtimeMs: number;
  /** Human-readable explanation for platform-level failures. */
  message?: string;
}

export interface RunResult {
  status: RunStatus;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  runtimeMs: number;
  message?: string;
}

/** Return value of a `judge` job, used by the API while waiting for a verdict. */
export interface JudgeJobOutcome {
  submissionId: string;
  status: string;
}

/** Statuses after which a submission will not change again. */
export function isFinalStatus(status: string): boolean {
  return (
    status !== QUEUED_STATUS &&
    status !== PROCESSING_STATUS
  );
}
