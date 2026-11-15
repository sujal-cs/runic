import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import * as schema from "./schema.js";

dotenv.config();

// Single shared pool + Drizzle instance. Keeping one pool avoids exhausting
// database connections when routes run concurrently.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://leetcode:leetcode@localhost:5432/leetcode",
});

export const db = drizzle(pool, { schema });
export { pool };
