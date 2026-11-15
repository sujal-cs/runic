import { Router } from "express";
import { db } from "../db/index.js";
import { problems } from "../db/schema.js";
import { eq, ilike, or, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q as string) || "";
    const difficulty = (req.query.difficulty as string) || "";
    const tag = (req.query.tag as string) || "";
    const sort = (req.query.sort as string) || "id";
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const offset = (page - 1) * limit;

    let query = db.select().from(problems);
    const conditions: any[] = [];
    if (q) conditions.push(or(ilike(problems.title, `%${q}%`), ilike(problems.slug, `%${q}%`)));
    if (difficulty) conditions.push(eq(problems.difficulty, difficulty));
    if (tag) conditions.push(sql`${problems.tags} @> ${JSON.stringify([tag])}::jsonb`);
    if (conditions.length) {
      // drizzle requires and() for multiple conditions
      const { and } = await import("drizzle-orm");
      query = query.where(and(...conditions)) as any;
    }

    const orderCol =
      sort === "title" ? problems.title : sort === "difficulty" ? problems.difficulty : problems.id;
    const rows = await query.orderBy(orderCol).limit(limit).offset(offset);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(problems);
    const mapped = rows.map((p: any) => ({
      id: p.id,
      frontend_id: p.frontendId,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      tags: p.tags,
      acceptance_rate: p.acceptanceRate,
    }));
    res.json({ problems: mapped, total: Number(count), page, limit });
  } catch (err) {
    next(err);
  }
});

router.get("/tags", async (_req, res, next) => {
  try {
    const rows = await db.select({ tags: problems.tags }).from(problems);
    const set = new Set<string>();
    for (const r of rows) for (const t of (r.tags as string[]) || []) set.add(t);
    res.json({ tags: [...set].sort() });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const [problem] = await db.select().from(problems).where(eq(problems.slug, req.params.slug));
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json({
      problem: {
        id: problem.id,
        frontend_id: problem.frontendId,
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        description: problem.description,
        examples: problem.examples,
        constraints: problem.constraints,
        test_cases: problem.testCases,
        code_snippets: problem.codeSnippets,
        tags: problem.tags,
        acceptance_rate: problem.acceptanceRate,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
