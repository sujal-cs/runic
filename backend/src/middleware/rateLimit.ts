import { Request, Response, NextFunction } from "express";

// Lightweight in-memory rate limiter for auth endpoints. This is sufficient for
// a single instance; replace with a Redis-backed limiter for multi-instance.
export function createRateLimiter(windowMs: number, max: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ error: "Too many requests, please try again later." });
    }
    next();
  };
}
