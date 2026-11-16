import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/index.js";
import { redis } from "./redis/client.js";
import { closeQueue } from "./queue/judgeQueue.js";

// Infrastructure often starts a moment after the API in local development.
// Retry briefly instead of crashing, and log each attempt so the terminal
// makes a missing database/Redis obvious.
async function waitFor(
  name: string,
  check: () => Promise<unknown>,
  attempts = 10,
): Promise<void> {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await check();
      console.log(`[startup] ${name} ready`);
      return;
    } catch (err: any) {
      const reason = err?.code ?? err?.message ?? String(err);
      if (attempt === attempts) throw err;
      console.warn(`[startup] ${name} not ready (attempt ${attempt}/${attempts}): ${reason}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

async function start() {
  await waitFor("postgres", () => pool.query("SELECT 1"));
  await waitFor("redis", () => redis.ping());

  const server = app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });

  // This process never executes submitted code. It only enqueues jobs for the
  // dedicated judge worker, which runs separately.
  console.log("[startup] judge worker is a separate process: `npm run worker -w backend`");

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[startup] ${signal} received, shutting down`);
    server.close();
    await closeQueue().catch(() => undefined);
    await redis.quit().catch(() => undefined);
    await pool.end().catch(() => undefined);
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
