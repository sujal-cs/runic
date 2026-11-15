import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me/submissions", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.language, s.status, s.runtime_ms, s.created_at, p.title, p.slug, p.difficulty
       FROM submissions s JOIN problems p ON p.id = s.problem_id
       WHERE s.user_id = $1 ORDER BY s.created_at DESC LIMIT 100`,
      [(req.session as any).userId],
    );
    res.json({ submissions: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:username", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, display_name, created_at FROM users WHERE username = $1",
      [req.params.username],
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
