import * as Redis from "ioredis";
import { env } from "../config/env.js";

// Redis backs session storage and the judge queue. The client is shared across
// the app; ioredis handles reconnection automatically.
export const redis = new (Redis as any).default(env.redisUrl);
