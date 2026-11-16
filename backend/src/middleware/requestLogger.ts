import type { RequestHandler } from "express";

// Logs every completed request with method, path, status, and duration. This
// makes missing requests (CORS, connection failures) and rejected requests
// visible in the backend terminal instead of failing silently.
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[api] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
};
