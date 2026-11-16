import type { Request, Response } from "express";
import { notFound } from "../errors.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { authenticatedUserId } from "../middleware/auth.js";
import { findUserByUsername, listUserSubmissionHistory } from "../services/users.service.js";

export const submissionHistory = asyncHandler(async (req: Request, res: Response) => {
  const rows = await listUserSubmissionHistory(authenticatedUserId(req));
  res.json({
    submissions: rows.map((row) => ({
      id: row.id,
      language: row.language,
      status: row.status,
      runtime_ms: row.runtimeMs,
      created_at: row.createdAt,
      title: row.title,
      slug: row.slug,
      difficulty: row.difficulty,
    })),
  });
});

// Public profile. Only non-sensitive fields are exposed.
export const getByUsername = asyncHandler(async (req: Request, res: Response) => {
  const user = await findUserByUsername(req.params.username);
  if (!user) throw notFound("User not found");

  res.json({
    user: {
      id: user.id,
      username: user.username,
      display_name: user.displayName,
      created_at: user.createdAt,
    },
  });
});
