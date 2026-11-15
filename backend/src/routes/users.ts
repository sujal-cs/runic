import { Router } from "express";
import { db } from "../db/index.js";
import { users, submissions, problems } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me/submissions", requireAuth, async (req, res, next) => {
  try {
    const userId = (req.session as any).userId;
    const rows = await db
      .select({
        id: submissions.id,
        language: submissions.language,
        status: submissions.status,
        runtimeMs: submissions.runtimeMs,
        createdAt: submissions.createdAt,
        title: problems.title,
        slug: problems.slug,
        difficulty: problems.difficulty,
      })
      .from(submissions)
      .innerJoin(problems, eq(problems.id, submissions.problemId))
      .where(eq(submissions.userId, userId))
      .orderBy(desc(submissions.createdAt))
      .limit(100);
    res.json({
      submissions: rows.map((r: any) => ({
        id: r.id,
        language: r.language,
        status: r.status,
        runtime_ms: r.runtimeMs,
        created_at: r.createdAt,
        title: r.title,
        slug: r.slug,
        difficulty: r.difficulty,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:username", async (req, res, next) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, req.params.username));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: { id: user.id, username: user.username, display_name: user.displayName, created_at: user.createdAt } });
  } catch (err) {
    next(err);
  }
});

export default router;
