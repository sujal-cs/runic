import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

// List problems with search, difficulty filter, tag filter, sorting, pagination.
router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q as string) || "";
    const difficulty = (req.query.difficulty as string) || "";
    const tag = (req.query.tag as string) || "";
    const sort = (req.query.sort as string) || "id";
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(title ILIKE $${params.length} OR slug ILIKE $${params.length})`);
    }
    if (difficulty) {
      params.push(difficulty);
      conditions.push(`difficulty = $${params.length}`);
    }
    if (tag) {
      params.push(JSON.stringify([tag]));
      conditions.push(`tags @> $${params.length}::jsonb`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const orderCol = sort === "title" ? "title" : sort === "difficulty" ? "difficulty" : "frontend_id::int";
    const { rows } = await pool.query(
      `SELECT id, frontend_id, title, slug, difficulty, tags, acceptance_rate
       FROM problems ${where}
       ORDER BY ${orderCol} ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset],
    );
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*)::int AS total FROM problems ${where}`,
      params,
    );
    res.json({ problems: rows, total: countRows[0].total, page, limit });
  } catch (err) {
    next(err);
  }
});

router.get("/tags", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT jsonb_array_elements_text(tags) AS tag FROM problems ORDER BY tag`,
    );
    res.json({ tags: rows.map((r) => r.tag) });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM problems WHERE slug = $1", [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: "Problem not found" });
    res.json({ problem: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
