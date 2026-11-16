import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";
import { AppError, getPostgresError } from "../errors.js";

// Wrap async controllers so rejected promises reach the error handler instead
// of becoming unhandled rejections.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Terminal 404 for unmatched routes. Registered after all routers.
export function notFoundHandler(req: Request, res: Response): void {
  console.warn(`[api] ${req.method} ${req.originalUrl} -> 404 Route not found`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler. Every route reports failures with the same shape:
// `{ error: string, details?: unknown }`. All failures are also written to the
// server console so a request never disappears silently.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const log = (status: number, message: string, details?: unknown): void => {
    const line = `[api] ${req.method} ${req.originalUrl} -> ${status} ${message}`;
    if (status >= 500) {
      console.error(line, details ?? "", err);
    } else {
      console.warn(line, details ?? "");
    }
  };

  if (err instanceof ZodError) {
    const [first] = err.issues;
    const message = first?.message ?? "Validation failed";
    log(400, message, err.issues);
    res.status(400).json({ error: message, details: err.issues });
    return;
  }

  if (err instanceof AppError) {
    log(err.status, err.message, err.details);
    res.status(err.status).json({
      error: err.message,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  // Drizzle wraps driver errors, so inspect the cause chain too.
  const pg = getPostgresError(err);
  if (pg?.code === "23505") {
    log(409, "Resource already exists", pg.constraint);
    res.status(409).json({ error: "Resource already exists" });
    return;
  }
  if (pg?.code === "22P02") {
    log(400, "Invalid identifier");
    res.status(400).json({ error: "Invalid identifier" });
    return;
  }

  const anyErr = err as any;

  // Body parser failures.
  if (anyErr?.type === "entity.parse.failed") {
    log(400, "Malformed JSON body");
    res.status(400).json({ error: "Malformed JSON body" });
    return;
  }
  if (anyErr?.type === "entity.too.large") {
    log(413, "Request body too large");
    res.status(413).json({ error: "Request body too large" });
    return;
  }

  const message = anyErr?.message || "Internal server error";
  log(500, message);
  res.status(500).json({ error: "Internal server error" });
}
