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
