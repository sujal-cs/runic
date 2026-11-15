import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { problems, submissions } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { runCode } from "../execution/runner.js";
import { evaluateSubmission } from "../execution/judge.js";

const router = Router();

const submitSchema = z.object({
  problemId: z.number().int(),
  language: z.string(),
  code: z.string().min(1),
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = submitSchema.parse(req.body);
    const [problem] = await db.select().from(problems).where(eq(problems.id, data.problemId));
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const evaluation = await evaluateSubmission(data.language, data.code, problem as any);
    const status = evaluation.status;
    const results = evaluation.results;
    const runtime = evaluation.runtimeMs;

    const [submission] = await db
      .insert(submissions)
      .values({
        userId: (req.session as any).userId,
        problemId: data.problemId,
        language: data.language,
        code: data.code,
        status,
        runtimeMs: runtime,
        result: results as any,
      })
      .returning();

    res.status(201).json({
      submission: {
        id: submission.id,
        problem_id: submission.problemId,
        language: submission.language,
        status: submission.status,
        runtime_ms: submission.runtimeMs,
        created_at: submission.createdAt,
      },
      results,
      status,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/run", requireAuth, async (req, res, next) => {
  try {
    const data = z.object({ language: z.string(), code: z.string().min(1), input: z.string().optional() }).parse(req.body);
    const run = await runCode(data.language, data.code, data.input ?? "");
    res.json({ result: run });
  } catch (err) {
    next(err);
  }
});

router.post("/run-all", requireAuth, async (req, res, next) => {
  try {
    const data = z.object({ problemId: z.number().int(), language: z.string(), code: z.string().min(1) }).parse(req.body);
    const [problem] = await db.select().from(problems).where(eq(problems.id, data.problemId));
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    const evaluation = await evaluateSubmission(data.language, data.code, problem as any);
    res.json({ status: evaluation.status, results: evaluation.results, runtimeMs: evaluation.runtimeMs });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const problemId = req.query.problemId ? Number(req.query.problemId) : null;
    const userId = (req.session as any).userId;
    let q = db.select().from(submissions).where(eq(submissions.userId, userId));
    const rows = await q.orderBy(submissions.createdAt).limit(50);
    const filtered = problemId ? rows.filter((r) => r.problemId === problemId) : rows;
    res.json({
      submissions: filtered.map((r: any) => ({
        id: r.id,
        problem_id: r.problemId,
        language: r.language,
        status: r.status,
        runtime_ms: r.runtimeMs,
        created_at: r.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, req.params.id as any));
    if (!submission || submission.userId !== (req.session as any).userId) return res.status(404).json({ error: "Submission not found" });
    res.json({
      submission: {
        id: submission.id,
        problem_id: submission.problemId,
        language: submission.language,
        status: submission.status,
        runtime_ms: submission.runtimeMs,
        created_at: submission.createdAt,
        result: submission.result,
        code: submission.code,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
