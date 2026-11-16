import { z } from "zod";

// Shared request schemas. Keeping them next to each other makes the public API
// surface easy to audit.

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(32),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  displayName: z.string().trim().min(1).max(64).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const languageSchema = z.string().trim().min(1).max(32);

export const submitSchema = z.object({
  problemId: z.coerce.number().int().positive(),
  language: languageSchema,
  code: z.string().min(1).max(200_000),
});

export const runCodeSchema = z.object({
  language: languageSchema,
  code: z.string().min(1).max(200_000),
  input: z.string().max(200_000).optional(),
});

export const runAllSchema = z.object({
  problemId: z.coerce.number().int().positive(),
  language: languageSchema,
  code: z.string().min(1).max(200_000),
});

export const submissionIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubmitInput = z.infer<typeof submitSchema>;
export type RunCodeInput = z.infer<typeof runCodeSchema>;
export type RunAllInput = z.infer<typeof runAllSchema>;
