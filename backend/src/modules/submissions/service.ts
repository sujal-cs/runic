import { and, desc, eq } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../db/index.js";
import { submissions } from "../../db/schema.js";
import { AppError, badRequest, notFound } from "../../errors.js";
import {
  enqueueJudgeJob,
  JOB_JUDGE,
  JOB_RUN,
  JOB_RUN_ALL,
  waitForJobResult,
} from "../../queue/judgeQueue.js";
import { resolveLanguage } from "../../shared/languages.js";
import {
  QUEUED_STATUS,
  type JudgeJobOutcome,
  type JudgeResult,
  type RunResult,
} from "../../shared/verdicts.js";
import { getProblemById } from "../problems/service.js";

// The API never evaluates code. It validates the request, records the
// submission, hands the work to the judge queue, and (for a better UX) waits a
// bounded amount of time for the verdict to land.

export type SubmissionRecord = typeof submissions.$inferSelect;

export type CreateSubmissionInput = {
  userId: string;
  problemId: number;
  language: string;
  code: string;
};

export type RunInput = { language: string; code: string; input: string };
export type RunAllInput = { problemId: number; language: string; code: string };

async function getSubmissionById(id: string): Promise<SubmissionRecord | null> {
  const [row] = await db.select().from(submissions).where(eq(submissions.id, id));
  return row ?? null;
}

function assertSupported(language: string): void {
  if (!resolveLanguage(language)) {
    throw badRequest(`Unsupported language: ${language}`);
  }
}

/**
 * Persist the submission and queue it. Returns the freshest row: if the worker
 * finishes within the wait budget the caller gets the final verdict, otherwise
 * it gets `Pending` and the frontend polls.
 */
export async function createSubmission(input: CreateSubmissionInput): Promise<SubmissionRecord> {
  const problem = await getProblemById(input.problemId);
  if (!problem) throw notFound("Problem not found");
  assertSupported(input.language);

  const [created] = await db
    .insert(submissions)
    .values({
      userId: input.userId,
      problemId: input.problemId,
      language: input.language,
      code: input.code,
      status: QUEUED_STATUS,
    })
    .returning();

  const job = await enqueueJudgeJob({ kind: JOB_JUDGE, submissionId: created.id });

  try {
    await waitForJobResult<JudgeJobOutcome>(job.id, env.judge.submitWaitMs);
  } catch (err) {
    // The submission row already exists and the worker records any failure on
    // it, so a slow or absent worker must not turn into a failed HTTP request.
    console.error("[submissions] judge job did not complete in time", err);
  }

  return (await getSubmissionById(created.id)) ?? created;
}

/** Ad-hoc run against a single user-provided input. Never persisted. */
export async function runCode(input: RunInput): Promise<RunResult> {
  assertSupported(input.language);
  const job = await enqueueJudgeJob({
    kind: JOB_RUN,
    language: input.language,
    code: input.code,
    input: input.input,
  });
  const result = await waitForJobResult<RunResult>(job.id, env.judge.runWaitMs);
  if (!result) throw new AppError(503, "The judge did not respond in time. Try again.");
  return result;
}

/** Run against every stored test case without persisting a submission. */
export async function runAll(input: RunAllInput): Promise<JudgeResult> {
  const problem = await getProblemById(input.problemId);
  if (!problem) throw notFound("Problem not found");
  assertSupported(input.language);

  const job = await enqueueJudgeJob({
    kind: JOB_RUN_ALL,
    problemId: input.problemId,
    language: input.language,
    code: input.code,
  });
  const result = await waitForJobResult<JudgeResult>(job.id, env.judge.runWaitMs);
  if (!result) throw new AppError(503, "The judge did not respond in time. Try again.");
  return result;
}

export async function listUserSubmissions(
  userId: string,
  problemId?: number | null,
): Promise<SubmissionRecord[]> {
  const where =
    problemId != null
      ? and(eq(submissions.userId, userId), eq(submissions.problemId, problemId))
      : eq(submissions.userId, userId);

  return db
    .select()
    .from(submissions)
    .where(where)
    .orderBy(desc(submissions.createdAt))
    .limit(50);
}

// Scoped lookup used by the authorization middleware. Returning null for both
// "missing" and "not yours" avoids leaking the existence of other users' rows.
export async function getSubmissionForUser(
  id: string,
  userId: string,
): Promise<SubmissionRecord | null> {
  const [submission] = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.id, id), eq(submissions.userId, userId)));
  return submission ?? null;
}
