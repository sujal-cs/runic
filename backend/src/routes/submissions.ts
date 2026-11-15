import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { runCode } from "../execution/runner.js";
import { evaluateSubmission } from "../execution/judge.js";

const router = Router();

const submitSchema = z.object({
  problemId: z.number().int(),
  language: z.string(),
  code: z.string().min(1),
});

// Execute a submission against the problem's stored test cases and persist it.
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = submitSchema.parse(req.body);
    const { rows: pRows } = await pool.query("SELECT * FROM problems WHERE id = $1", [data.problemId]);
    const problem = pRows[0];
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const evaluation = await evaluateSubmission(data.language, data.code, problem);
    const status = evaluation.status;
    const results = evaluation.results;
    const runtime = evaluation.runtimeMs;

    const { rows } = await pool.query(
      `INSERT INTO submissions (user_id, problem_id, language, code, status, runtime_ms, result)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, status, runtime_ms, created_at`,
      [(req.session as any).userId, data.problemId, data.language, data.code, status, runtime, JSON.stringify(results)],
    );
    res.status(201).json({ submission: rows[0], results, status });
  } catch (err) {
    next(err);
  }
});

// Run code against a single provided input without persisting.
router.post("/run", requireAuth, async (req, res, next) => {
  try {
    const data = z
      .object({ language: z.string(), code: z.string().min(1), input: z.string().optional() })
      .parse(req.body);
    const run = await runCode(data.language, data.code, data.input ?? "");
    res.json({ result: run });
  } catch (err) {
    next(err);
  }
});

// Run the solution against all sample test cases without persisting a submission.
router.post("/run-all", requireAuth, async (req, res, next) => {
  try {
    const data = z
      .object({ problemId: z.number().int(), language: z.string(), code: z.string().min(1) })
      .parse(req.body);
    const { rows: pRows } = await pool.query("SELECT * FROM problems WHERE id = $1", [data.problemId]);
    const problem = pRows[0];
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    const evaluation = await evaluateSubmission(data.language, data.code, problem);
    res.json({ status: evaluation.status, results: evaluation.results, runtimeMs: evaluation.runtimeMs });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const problemId = req.query.problemId;
    const params: any[] = [(req.session as any).userId];
    let where = "WHERE user_id = $1";
    if (problemId) {
      params.push(Number(problemId));
      where += ` AND problem_id = $${params.length}`;
    }
    const { rows } = await pool.query(
      `SELECT id, problem_id, language, status, runtime_ms, created_at
       FROM submissions ${where} ORDER BY created_at DESC LIMIT 50`,
      params,
    );
    res.json({ submissions: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM submissions WHERE id = $1 AND user_id = $2",
      [req.params.id, (req.session as any).userId],
    );
    if (!rows[0]) return res.status(404).json({ error: "Submission not found" });
    res.json({ submission: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
