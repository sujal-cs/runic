import type { Request, Response } from "express";
import { notFound } from "../../errors.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import {
  getProblemBySlug,
  listProblems,
  listTags,
  type ProblemRecord,
} from "./service.js";

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toSummary(problem: ProblemRecord) {
  return {
    id: problem.id,
    frontend_id: problem.frontendId,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    tags: problem.tags,
    acceptance_rate: problem.acceptanceRate,
  };
}

function toDetail(problem: ProblemRecord) {
  return {
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
  };
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await listProblems({
    q: queryString(req.query.q),
    difficulty: queryString(req.query.difficulty),
    tag: queryString(req.query.tag),
    sort: queryString(req.query.sort),
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 20),
  });

  res.json({
    problems: result.problems.map(toSummary),
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

export const tags = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ tags: await listTags() });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const problem = await getProblemBySlug(req.params.slug);
  if (!problem) throw notFound("Problem not found");
  res.json({ problem: toDetail(problem) });
});
