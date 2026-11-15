import { Request, Response, NextFunction } from "express";

// Ensures a valid session exists before allowing access to protected routes.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any).userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
