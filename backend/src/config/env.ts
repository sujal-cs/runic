import dotenv from "dotenv";

dotenv.config();

// Centralized environment access keeps configuration in one place and makes
// missing values obvious during startup.
export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  sessionSecret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
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
