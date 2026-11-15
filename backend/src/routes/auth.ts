import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
});

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(data.password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES ($1, $2, $3, $4) RETURNING id, username, email, display_name`,
      [data.username, data.email, hash, data.displayName || data.username],
    );
    (req.session as any).userId = rows[0].id;
    res.status(201).json({ user: rows[0] });
  } catch (err: any) {
    if (err.code === "23505") {
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

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [data.email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    (req.session as any).userId = user.id;
    res.json({
      user: { id: user.id, username: user.username, email: user.email, display_name: user.display_name },
    });
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
  const { rows } = await pool.query(
    "SELECT id, username, email, display_name, created_at FROM users WHERE id = $1",
    [(req.session as any).userId],
  );
  if (!rows[0]) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: rows[0] });
});

export default router;
