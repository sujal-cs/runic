import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Single shared connection pool for PostgreSQL. Keeping one pool avoids
// exhausting database connections when routes run concurrently.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://leetcode:leetcode@localhost:5432/leetcode",
});
