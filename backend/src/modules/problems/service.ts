import { and, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import { problems } from "../../db/schema.js";

export type ProblemRecord = typeof problems.$inferSelect;

export type ListProblemsParams = {
  q?: string;
  difficulty?: string;
  tag?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type ListProblemsResult = {
  problems: ProblemRecord[];
  total: number;
  page: number;
  limit: number;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function normalizePage(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export async function listProblems(params: ListProblemsParams): Promise<ListProblemsResult> {
  const q = params.q?.trim() ?? "";
  const difficulty = params.difficulty?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const sort = params.sort ?? "id";

  const page = normalizePage(params.page, 1);
  const limit = Math.min(MAX_LIMIT, normalizePage(params.limit, DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (q) {
    const term = `%${q}%`;
    const search = or(ilike(problems.title, term), ilike(problems.slug, term));
    if (search) conditions.push(search);
  }
  if (difficulty) conditions.push(eq(problems.difficulty, difficulty));
  if (tag) conditions.push(sql`${problems.tags} @> ${JSON.stringify([tag])}::jsonb`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderColumn =
    sort === "title"
      ? problems.title
      : sort === "difficulty"
        ? problems.difficulty
        : problems.id;

  const rows = await db
    .select()
    .from(problems)
    .where(where)
    .orderBy(orderColumn)
    .limit(limit)
    .offset(offset);

  // Count with the same filters so pagination reflects the filtered set.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(problems)
    .where(where);

  return { problems: rows, total: Number(count), page, limit };
}

export async function getProblemBySlug(slug: string): Promise<ProblemRecord | null> {
  const [problem] = await db.select().from(problems).where(eq(problems.slug, slug));
  return problem ?? null;
}

export async function getProblemById(id: number): Promise<ProblemRecord | null> {
  const [problem] = await db.select().from(problems).where(eq(problems.id, id));
  return problem ?? null;
}

export async function listTags(): Promise<string[]> {
  const rows = await db.select({ tags: problems.tags }).from(problems);
  const tags = new Set<string>();
  for (const row of rows) {
    for (const tag of (row.tags as string[] | null) ?? []) tags.add(tag);
  }
  return [...tags].sort();
}
