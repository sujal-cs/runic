import type { Request, Response } from "express";
import { unauthorized } from "../../errors.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { authenticatedUserId } from "../../middleware/auth.js";
import { authenticateUser, getPublicUserById, registerUser } from "./service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await registerUser(req.body);
  req.session.userId = user.id;
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const user = await authenticateUser(req.body.email, req.body.password);
  req.session.userId = user.id;
  res.json({ user });
});

export const logout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to log out" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
};

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getPublicUserById(authenticatedUserId(req));
  if (!user) throw unauthorized("Not authenticated");
  res.json({ user });
});
