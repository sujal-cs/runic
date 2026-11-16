import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

type RequestSource = "body" | "query" | "params";

// Validates and replaces a request section with the parsed value, so
// controllers can rely on typed, coerced input. Errors flow to the central
// error handler and become a 400 response.
export function validate(schema: ZodTypeAny, source: RequestSource = "body"): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Express 4 request sections are plain, mutable objects.
    (req as any)[source] = result.data;
    next();
  };
}
