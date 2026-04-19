import { z } from "zod";
import { INTERVIEW_PACKAGE_SLUGS, INTERVIEW_MODES, TUTOR_SLUGS } from "../constants/index.js";

export const StartSessionSchema = z.object({
  packageSlug: z.enum(INTERVIEW_PACKAGE_SLUGS),
  tutorSlug: z.enum(TUTOR_SLUGS),
  mode: z.enum(INTERVIEW_MODES).default("voice"),
  provider: z.string().optional(),
});

export const EndSessionSchema = z.object({
  sessionId: z.string().min(1),
  transcript: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        timestamp: z.string().datetime(),
      })
    )
    .optional(),
});

export const SessionResponseSchema = z.object({
  sessionId: z.string(),
  status: z.enum(["ACTIVE", "ENDED", "ANALYZING", "ANALYZED", "FAILED"]),
  packageSlug: z.enum(INTERVIEW_PACKAGE_SLUGS),
  tutorSlug: z.enum(TUTOR_SLUGS),
  mode: z.enum(INTERVIEW_MODES),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable().optional(),
});

export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type EndSessionInput = z.infer<typeof EndSessionSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;
