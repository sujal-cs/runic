import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";

async function start() {
  // Verify database connectivity before accepting traffic.
  await pool.query("SELECT 1");
  app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
