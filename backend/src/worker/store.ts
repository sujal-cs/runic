import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { problems, submissions } from "../db/schema.js";
import { PROCESSING_STATUS, QUEUED_STATUS, type JudgeResult } from "../shared/verdicts.js";

// All database writes performed on behalf of the judge worker. The API owns
// creation of the submission row; the worker owns its lifecycle from
// Processing to a final verdict.

export type WorkerSubmission = typeof submissions.$inferSelect;
export type WorkerProblem = typeof problems.$inferSelect;

export async function loadSubmission(id: string): Promise<WorkerSubmission | null> {
  const [row] = await db.select().from(submissions).where(eq(submissions.id, id));
  return row ?? null;
}

export async function loadProblem(id: number): Promise<WorkerProblem | null> {
  const [row] = await db.select().from(problems).where(eq(problems.id, id));
  return row ?? null;
}

export async function markProcessing(id: string): Promise<void> {
  await db
    .update(submissions)
    .set({ status: PROCESSING_STATUS })
    .where(and(eq(submissions.id, id), eq(submissions.status, QUEUED_STATUS)));
}

export async function saveVerdict(id: string, verdict: JudgeResult): Promise<void> {
  await db
    .update(submissions)
    .set({
      status: verdict.status,
      runtimeMs: verdict.runtimeMs,
      result: verdict.results as unknown as object,
      message: verdict.message ?? null,
    })
    .where(eq(submissions.id, id));
}

export async function markFailed(id: string, message: string): Promise<void> {
  await db
    .update(submissions)
    .set({ status: "Judge Error", message, result: [] })
    .where(
      and(
        eq(submissions.id, id),
        inArray(submissions.status, [QUEUED_STATUS, PROCESSING_STATUS]),
      ),
    );
}

/**
 * Recover submissions orphaned by a worker crash. Anything stuck in Processing
 * past the grace period was never finished, so it is surfaced as an error
 * instead of spinning in the UI forever.
 */
export async function reapStaleSubmissions(olderThanMs = 10 * 60_000): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanMs);
  const rows = await db
    .update(submissions)
    .set({
      status: "Judge Error",
      message: "The judge worker stopped before finishing this submission",
    })
    .where(and(eq(submissions.status, PROCESSING_STATUS), lt(submissions.createdAt, cutoff)))
    .returning({ id: submissions.id });

  if (rows.length > 0) {
    console.warn(`[worker] reaped ${rows.length} stale submission(s)`);
  }
  return rows.length;
}
