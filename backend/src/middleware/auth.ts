import type { NextFunction, Request, Response } from "express";
import { forbidden, notFound, unauthorized } from "../errors.js";
import { getSubmissionForUser } from "../services/submissions.service.js";

// The only source of truth for "who is calling" is the Redis-backed session.
// Route code never trusts client-supplied user identifiers.
export function currentUserId(req: Request): string | undefined {
  return req.session.userId;
}

// Variant for handlers mounted behind requireAuth, where the session must
// already exist.
export function authenticatedUserId(req: Request): string {
  const userId = req.session.userId;
  if (!userId) throw unauthorized();
  return userId;
}

// Authentication: rejects anonymous callers from protected routes.
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    next(unauthorized());
    return;
  }
  next();
}

// Authorization: the authenticated user may only act on their own :userId.
export function requireSelf(param = "userId"): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    if (!req.session.userId) {
      next(unauthorized());
      return;
    }
    const target = req.params[param];
    if (target && target !== req.session.userId) {
      next(forbidden("You can only access your own resources"));
      return;
    }
    next();
  };
}

// Authorization for submission detail routes. Resolving ownership here means
// the controller receives a submission already scoped to the caller, which
// prevents an accidental cross-user read if route logic changes later.
export function requireSubmissionOwner(
  param = "id",
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    try {
      const userId = currentUserId(req);
      if (!userId) throw unauthorized();

      const submission = await getSubmissionForUser(req.params[param], userId);
      if (!submission) throw notFound("Submission not found");

      res.locals.submission = submission;
      next();
    } catch (err) {
      next(err);
    }
  };
}
