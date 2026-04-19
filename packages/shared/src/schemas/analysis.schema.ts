import { z } from "zod";

// All scores are 0–10; overall is LLM-computed, not an average of the rest
export const ScoreSchema = z.object({
  overall: z.number().min(0).max(10),
  communication: z.number().min(0).max(10),
  technicalAccuracy: z.number().min(0).max(10),
  problemSolving: z.number().min(0).max(10),
  confidence: z.number().min(0).max(10),
  clarity: z.number().min(0).max(10),
});

// Full analysis output produced by the LLM after a session ends
export const AnalysisResultSchema = z.object({
  sessionId: z.string().min(1),
  scores: ScoreSchema,
  strengths: z.array(z.string()).min(1),
  improvements: z.array(z.string()).min(1),
  report: z.string().min(1), // markdown narrative shown to the user
  provider: z.string(), // which LLM in the fallback chain generated this
  generatedAt: z.string().datetime(),
});

// Polled by the frontend to track async analysis progress
export const AnalysisStatusSchema = z.object({
  sessionId: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"]),
  progress: z.number().min(0).max(100).optional(), // 0–100 percentage, absent until IN_PROGRESS
  error: z.string().optional(),
  result: AnalysisResultSchema.optional(), // populated only when status is COMPLETED
});

// Request body for POST /analysis/trigger
export const TriggerAnalysisSchema = z.object({
  sessionId: z.string().min(1),
  preferredProvider: z.string().optional(), // overrides fallback chain when set
});

export type Scores = z.infer<typeof ScoreSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;
export type TriggerAnalysisInput = z.infer<typeof TriggerAnalysisSchema>;
