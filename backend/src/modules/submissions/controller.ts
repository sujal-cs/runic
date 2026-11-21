import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { authenticatedUserId } from "../../middleware/auth.js";
import {
  createSubmission,
  listUserSubmissions,
  runAll,
  runCode,
  type SubmissionRecord,
} from "./service.js";

function toSummary(submission: SubmissionRecord) {
  return {
    id: submission.id,
    problem_id: submission.problemId,
    language: submission.language,
    status: submission.status,
    runtime_ms: submission.runtimeMs,
    message: submission.message,
    created_at: submission.createdAt,
  };
}

function toDetail(submission: SubmissionRecord) {
  return {
    ...toSummary(submission),
    result: submission.result,
    results: Array.isArray(submission.result) ? submission.result : [],
    code: submission.code,
  };
}

// Creates the submission, queues it, and returns whatever verdict is available
// within the wait budget. A `Pending` status means the frontend should poll
// `GET /api/submissions/:id`.
export const create = asyncHandler(async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { problemId, language, code } = req.body;

  const submission = await createSubmission({ userId, problemId, language, code });

  res.status(201).json({
    submission: toSummary(submission),
    results: Array.isArray(submission.result) ? submission.result : [],
    status: submission.status,
    message: submission.message,
  });
});

// Ad-hoc run against a single user-provided input. Does not persist anything.
export const run = asyncHandler(async (req: Request, res: Response) => {
  const { language, code, input } = req.body;
  res.json({ result: await runCode({ language, code, input: input ?? "" }) });
});

// Run against every stored test case without persisting a submission.
export const runAllHandler = asyncHandler(async (req: Request, res: Response) => {
  const { problemId, language, code } = req.body;
  const evaluation = await runAll({ problemId, language, code });
  res.json({
    status: evaluation.status,
    results: evaluation.results,
    runtimeMs: evaluation.runtimeMs,
    message: evaluation.message,
  });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const raw = req.query.problemId;
  const parsed = typeof raw === "string" && raw !== "" ? Number(raw) : NaN;
  const problemId = Number.isFinite(parsed) ? parsed : null;

  const rows = await listUserSubmissions(authenticatedUserId(req), problemId);
  res.json({ submissions: rows.map(toSummary) });
});

export const getById = asyncHandler(async (_req: Request, res: Response) => {
  // requireSubmissionOwner resolved and authorized this row.
  res.json({ submission: toDetail(res.locals.submission as SubmissionRecord) });
});
