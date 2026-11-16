import { Worker } from "bullmq";
import { env } from "../config/env.js";
import { pool } from "../db/index.js";
import { redis } from "../redis/client.js";
import { judgeQueue, JOB_JUDGE, redisConnectionOptions } from "../queue/judgeQueue.js";
import { LANGUAGES } from "../shared/languages.js";
import { dockerAvailable, ensureImage, sweepOrphanContainers, sweepOrphanWorkDirs } from "./docker.js";
import { processJob } from "./processor.js";
import { markFailed, reapStaleSubmissions } from "./store.js";

// Dedicated judge worker. This is the only process that talks to Docker and
// the only process that can run submitted code. It is started separately from
// the API (`npm run worker -w backend`) so a compromised execution can never
// reach the Express server, its sessions, or its credentials.

async function start(): Promise<void> {
  if (!(await dockerAvailable())) {
    console.error(
      "[worker] Docker daemon is not reachable. Start Docker and ensure this user can run `docker ps`.",
    );
    process.exit(1);
  }
  console.log("[worker] docker daemon reachable");

  // Reclaim containers left behind by a previous worker (for example after a
  // SIGKILL). Anything younger than this could belong to a live worker.
  await sweepOrphanContainers(Math.max(120_000, env.judge.timeoutMs * 6));
  await sweepOrphanWorkDirs(Math.max(120_000, env.judge.timeoutMs * 6));
  await reapStaleSubmissions();

  const images = [...new Set(LANGUAGES.map((definition) => definition.image))];
  for (const image of images) {
    const ready = await ensureImage(image);
    if (!ready) {
      console.warn(`[worker] image ${image} is unavailable; jobs needing it will fail`);
    }
  }

  const worker = new Worker(env.judge.queueName, processJob, {
    connection: redisConnectionOptions(),
    concurrency: env.judge.concurrency,
    // A submission may run several containers back to back. BullMQ renews the
    // lock while the job is active, so this only bounds crash recovery time.
    lockDuration: env.judge.lockMs,
    maxStalledCount: 2,
    stalledInterval: Math.max(5_000, Math.floor(env.judge.lockMs / 2)),
  });

  worker.on("ready", () => {
    console.log(
      `[worker] consuming "${env.judge.queueName}" with concurrency ${env.judge.concurrency}`,
    );
  });

  worker.on("completed", (job) => {
    console.log(`[worker] job ${job.name}:${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[worker] job ${job?.name}:${job?.id} failed: ${err.message}`);
    // Only give up on the submission once every retry has been exhausted.
    const attempts = job?.opts.attempts ?? 1;
    if (job && job.name === JOB_JUDGE && job.attemptsMade >= attempts) {
      const submissionId = (job.data as { submissionId?: string }).submissionId;
      if (submissionId) {
        void markFailed(submissionId, err.message || "Judge worker error");
      }
    }
  });

  worker.on("error", (err) => {
    console.error("[worker] queue error:", err.message);
  });

  let shuttingDown = false;
  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[worker] ${signal} received, finishing active jobs...`);
    try {
      await worker.close();
      await judgeQueue.close();
      await redis.quit();
      await pool.end();
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch(async (err) => {
  console.error("[worker] failed to start:", err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
