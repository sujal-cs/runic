import * as Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Redis is used for session storage and lightweight caching. The client is
// shared across the app; ioredis handles reconnection automatically.
export const redis = new (Redis as any).default(process.env.REDIS_URL || "redis://localhost:6379");
