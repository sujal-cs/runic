import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const session = require("express-session");
import RedisStore from "connect-redis";
import { redis } from "./redis/client.js";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import problemRoutes from "./routes/problems.js";
import submissionRoutes from "./routes/submissions.js";
import userRoutes from "./routes/users.js";

const app = express();

// Security headers and CORS configured for the SPA origin.
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

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
    await pool.query("SELECT 1");
    await redis.ping();
    res.json({ ok: true, database: "up", redis: "up" });
  } catch (err: any) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);

// Central error handler keeps route code simple.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

export default app;
