import { z } from "zod";

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

export type SubmitInput = z.infer<typeof submitSchema>;
export type RunCodeInput = z.infer<typeof runCodeSchema>;
export type RunAllInput = z.infer<typeof runAllSchema>;
