import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { createRateLimiter } from "../middleware/rateLimit.js";

const router = Router();
const authLimiter = createRateLimiter(15 * 60 * 1000, 20);

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(data.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        passwordHash: hash,
        displayName: data.displayName || data.username,
      })
      .returning();
    (req.session as any).userId = user.id;
    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email, display_name: user.displayName } });
  } catch (err: any) {
    if (err?.code === "23505") {
      err.status = 409;
      err.message = "Username or email already exists";
    }
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, data.email));
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    (req.session as any).userId = user.id;
    res.json({ user: { id: user.id, username: user.username, email: user.email, display_name: user.displayName } });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/me", async (req, res) => {
  if (!(req.session as any).userId) return res.status(401).json({ error: "Not authenticated" });
  const [user] = await db.select().from(users).where(eq(users.id, (req.session as any).userId));
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: { id: user.id, username: user.username, email: user.email, display_name: user.displayName, created_at: user.createdAt } });
});

export default router;
