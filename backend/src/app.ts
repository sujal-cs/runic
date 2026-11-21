import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const session = require("express-session");
import RedisStore from "connect-redis";
import { redis } from "./redis/client.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import authRoutes from "./modules/auth/routes.js";
import problemRoutes from "./modules/problems/routes.js";
import submissionRoutes from "./modules/submissions/routes.js";
import userRoutes from "./modules/users/routes.js";

const app = express();

// Security headers and CORS configured for the SPA origin. In development any
// origin is echoed so the app works from localhost, 127.0.0.1, or a LAN host;
// production stays locked to FRONTEND_URL.
app.use(helmet());
app.use(
  cors({
    origin: env.nodeEnv === "production" ? env.frontendUrl : true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

// Sessions are persisted in Redis so authentication survives server restarts
// and can scale horizontally later.
app.use(
  (session as any)({
    store: new (RedisStore as any)({ client: redis }),
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.get("/api/health", async (_req, res) => {
  try {
    const { pool } = await import("./db/index.js");
    const { redis } = await import("./redis/client.js");
    const { judgeQueue } = await import("./queue/judgeQueue.js");
    await pool.query("SELECT 1");
    await redis.ping();

    // Surface queue health so a missing judge worker is visible without
    // digging through Redis.
    const [workers, counts] = await Promise.all([
      judgeQueue.getWorkersCount().catch(() => 0),
      judgeQueue.getJobCounts("waiting", "active").catch(() => ({ waiting: 0, active: 0 })),
    ]);

    res.json({
      ok: true,
      database: "up",
      redis: "up",
      judge: { workers, waiting: counts.waiting ?? 0, active: counts.active ?? 0 },
    });
  } catch (err: any) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);

// Unmatched routes get the same JSON error shape as handled failures.
app.use(notFoundHandler);

// Central error handler. Must be registered last, after all routes.
app.use(errorHandler);

export default app;
