import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { problems, submissions, users } from "../db/schema.js";

export type UserRecord = typeof users.$inferSelect;

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const [user] = await db.select().from(users).where(eq(users.username, username));
  return user ?? null;
}

// Submission history joined with just the problem fields the profile table
// needs, newest first.
export async function listUserSubmissionHistory(userId: string) {
  return db
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
}
