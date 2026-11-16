import { Queue, type ConnectionOptions, type Job } from "bullmq";
import { env } from "../config/env.js";
import { AppError } from "../errors.js";
import type { JudgeJobOutcome } from "../shared/verdicts.js";

// Queue shared by the API (producer) and the judge worker (consumer). The API
// only ever enqueues work; it never imports execution code.

export const JOB_JUDGE = "judge";
export const JOB_RUN = "run";
export const JOB_RUN_ALL = "run-all";

export type JudgeJobData =
  | { kind: typeof JOB_JUDGE; submissionId: string }
  | { kind: typeof JOB_RUN; language: string; code: string; input: string }
  | { kind: typeof JOB_RUN_ALL; problemId: number; language: string; code: string };

export type JudgeJobName = typeof JOB_JUDGE | typeof JOB_RUN | typeof JOB_RUN_ALL;

/** Connection options parsed from REDIS_URL, shared by queue and worker. */
export function redisConnectionOptions(): ConnectionOptions {
  const url = new URL(env.redisUrl);
  const dbFromPath = url.pathname.replace(/^\//, "");

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
    ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
    ...(dbFromPath ? { db: Number(dbFromPath) } : {}),
    // BullMQ requires blocking-friendly connections.
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export const judgeQueue = new Queue<JudgeJobData>(env.judge.queueName, {
  connection: redisConnectionOptions(),
  defaultJobOptions: {
    // A stalled container is retried once; the worker also reaps stuck rows.
    attempts: 2,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600, count: 1000 },
  },
});

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export async function enqueueJudgeJob(data: JudgeJobData): Promise<Job<JudgeJobData>> {
  // The queue is typed by the union of job shapes; BullMQ's generic narrowing
  // cannot follow a discriminated union at a single call site, so the cast is
  // confined to this one boundary.
  const job = await judgeQueue.add(data.kind, data as never);
  return job as unknown as Job<JudgeJobData>;
}

/**
 * Poll the queue for a job's return value. Polling Redis directly (instead of
 * `waitUntilFinished`) keeps the API free of long-lived event subscriptions and
 * is race-free if the job finishes before the first poll.
 *
 * Returns `null` when the deadline passes without a verdict.
 */
export async function waitForJobResult<T>(
  jobId: string | undefined,
  timeoutMs: number,
): Promise<T | null> {
  if (!jobId) return null;

  const deadline = Date.now() + timeoutMs;
  const workerCheckAt = Date.now() + 5_000;
  let checkedForWorker = false;

  while (Date.now() < deadline) {
    const job = await judgeQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    if (state === "completed") return (job.returnvalue ?? null) as T | null;
    if (state === "failed") {
      throw new AppError(500, job.failedReason || "Judge job failed");
    }

    // Fail fast with an actionable message when nothing is consuming the queue,
    // instead of making the user wait out the full timeout.
    if (!checkedForWorker && Date.now() > workerCheckAt) {
      checkedForWorker = true;
      const workers = await judgeQueue.getWorkersCount().catch(() => 0);
      if (workers === 0) {
        throw new AppError(
          503,
          "Judge worker is not running. Start it with `npm run worker -w backend`.",
        );
      }
    }

    await sleep(200);
  }

  return null;
}

export async function closeQueue(): Promise<void> {
  await judgeQueue.close();
}
