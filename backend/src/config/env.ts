import dotenv from "dotenv";

dotenv.config();

const number = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Centralized environment access keeps configuration in one place and makes
// missing values obvious during startup.
export const env = {
  port: number(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  sessionSecret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL || "postgresql://leetcode:leetcode@localhost:5432/leetcode",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // Judge worker tuning. Untrusted code never runs in this process; these
  // values only describe how long the API waits for a worker to answer and how
  // the worker constrains each execution container.
  judge: {
    queueName: process.env.JUDGE_QUEUE_NAME || "codeforge-judge",
    concurrency: number(process.env.JUDGE_CONCURRENCY, 2),
    timeoutMs: number(process.env.JUDGE_TIMEOUT_MS, 10_000),
    // How long the API blocks a Run/Submit request waiting for the worker.
    runWaitMs: number(process.env.JUDGE_RUN_WAIT_MS, 45_000),
    submitWaitMs: number(process.env.JUDGE_SUBMIT_WAIT_MS, 30_000),
    // Hard cap on stdout+stderr collected from a container.
    maxOutputBytes: number(process.env.JUDGE_MAX_OUTPUT_BYTES, 65_536),
    // BullMQ job lock. A crashed worker's job is reclaimed after this expires.
    lockMs: number(process.env.JUDGE_LOCK_MS, 120_000),
    // Writable scratch space inside each container (compiled output, tmp files).
    tmpfsMb: number(process.env.JUDGE_TMPFS_MB, 64),
    containerPrefix: process.env.JUDGE_CONTAINER_PREFIX || "codeforge-judge",
    images: {
      javascript: process.env.JUDGE_IMAGE_JAVASCRIPT || "node:22-alpine",
      python3: process.env.JUDGE_IMAGE_PYTHON || "python:3.12-alpine",
      c: process.env.JUDGE_IMAGE_C || "gcc:13-bookworm",
      cpp: process.env.JUDGE_IMAGE_CPP || "gcc:13-bookworm",
      go: process.env.JUDGE_IMAGE_GO || "golang:1.22-alpine",
      rust: process.env.JUDGE_IMAGE_RUST || "rust:1-alpine",
    } as Record<string, string>,
  },
};

if (env.nodeEnv === "production") {
  const required = ["DATABASE_URL", "REDIS_URL", "SESSION_SECRET", "FRONTEND_URL"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  if (env.sessionSecret === "dev-session-secret-change-me") {
    throw new Error("SESSION_SECRET must be set in production");
  }
}
