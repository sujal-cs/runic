// Shared application error type. Services throw these; the central error
// handler turns them into consistent JSON responses.
export class AppError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, message, details);

export const unauthorized = (message = "Authentication required") =>
  new AppError(401, message);

export const forbidden = (message = "Forbidden") => new AppError(403, message);

export const notFound = (message = "Not found") => new AppError(404, message);

export const conflict = (message: string) => new AppError(409, message);

// Drizzle wraps driver errors in a `DrizzleQueryError` with the original
// Postgres error on `cause`. Walk the chain so callers can still inspect
// `code` / `constraint` without caring which layer produced the error.
export interface PostgresError {
  code?: string;
  constraint?: string;
  detail?: string;
}

export function getPostgresError(err: unknown): PostgresError | null {
  let current: any = err;
  for (let depth = 0; current && depth < 6; depth += 1) {
    if (typeof current.code === "string") return current as PostgresError;
    current = current.cause;
  }
  return null;
}
