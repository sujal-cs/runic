import type { Job } from "bullmq";
import { JOB_JUDGE, JOB_RUN, JOB_RUN_ALL, type JudgeJobData } from "../queue/judgeQueue.js";
import type { JudgeJobOutcome, JudgeResult, RunResult } from "../shared/verdicts.js";
import { evaluateSubmission } from "./judge.js";
import { runCode } from "./runner.js";
import { loadProblem, loadSubmission, markFailed, markProcessing, saveVerdict } from "./store.js";

// Job processor. One job == one isolated execution session; the queue supplies
// concurrency, retries, and crash recovery.

async function processJudging(job: Job<JudgeJobData>): Promise<JudgeJobOutcome> {
  if (job.data.kind !== JOB_JUDGE) throw new Error("Unexpected job data");
  const { submissionId } = job.data;

  await markProcessing(submissionId);

  const submission = await loadSubmission(submissionId);
  if (!submission) {
    // The user was deleted while the job was queued; nothing to persist.
    console.warn(`[worker] submission ${submissionId} no longer exists`);
    return { submissionId, status: "Judge Error" };
  }

  const problem = await loadProblem(submission.problemId);
  if (!problem) {
    await markFailed(submissionId, "Problem no longer exists");
    return { submissionId, status: "Judge Error" };
  }

  try {
    const verdict = await evaluateSubmission(
      submission.language,
      submission.code,
      problem,
      String(job.id),
    );
    await saveVerdict(submissionId, verdict);
    console.log(
      `[worker] judged ${submissionId} -> ${verdict.status} (${verdict.runtimeMs}ms)`,
    );
    return { submissionId, status: verdict.status };
  } catch (err: any) {
    console.error(`[worker] judging ${submissionId} failed`, err);
    await markFailed(submissionId, err?.message ?? "Judge worker error");
    throw err;
  }
}

async function processRunAll(job: Job<JudgeJobData>): Promise<JudgeResult> {
  if (job.data.kind !== JOB_RUN_ALL) throw new Error("Unexpected job data");
  const problem = await loadProblem(job.data.problemId);
  if (!problem) {
    return {
      status: "Judge Error",
      results: [],
      runtimeMs: 0,
      message: "Problem not found",
    };
  }
  return evaluateSubmission(job.data.language, job.data.code, problem, String(job.id));
}

async function processRun(job: Job<JudgeJobData>): Promise<RunResult> {
  if (job.data.kind !== JOB_RUN) throw new Error("Unexpected job data");
  const { language, code, input } = job.data;
  return runCode(language, code, input, String(job.id));
}

export async function processJob(job: Job<JudgeJobData>): Promise<unknown> {
  switch (job.name) {
    case JOB_JUDGE:
      return processJudging(job);
    case JOB_RUN_ALL:
      return processRunAll(job);
    case JOB_RUN:
      return processRun(job);
    default:
      throw new Error(`Unknown judge job: ${job.name}`);
  }
}
