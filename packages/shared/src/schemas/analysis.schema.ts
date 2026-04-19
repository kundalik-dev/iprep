import { z } from "zod";

export const ScoreSchema = z.object({
  overall: z.number().min(0).max(10),
  communication: z.number().min(0).max(10),
  technicalAccuracy: z.number().min(0).max(10),
  problemSolving: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  clarity: z.number().min(0).max(10),
});

export const AnalysisResultSchema = z.object({
  sessionId: z.string().min(1),
  scores: ScoreSchema,
  strengths: z.array(z.string()).min(1),
  improvements: z.array(z.string()).min(1),
  report: z.string().min(1),
  provider: z.string(),
  generatedAt: z.string().datetime(),
});

export const AnalysisStatusSchema = z.object({
  sessionId: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"]),
  progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
  result: AnalysisResultSchema.optional(),
});

export const TriggerAnalysisSchema = z.object({
  sessionId: z.string().min(1),
  preferredProvider: z.string().optional(),
});

export type Scores = z.infer<typeof ScoreSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;
export type TriggerAnalysisInput = z.infer<typeof TriggerAnalysisSchema>;
