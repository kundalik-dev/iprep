import { z } from "zod";
import { PROVIDER_TYPES, LLM_PROVIDER_SLUGS } from "../constants/index.js";

export const BYOKKeySchema = z.object({
  provider: z.enum(["deepgram", "anthropic", "gemini", "openai"]),
  key: z.string().min(1),
});

export const ProviderStatusSchema = z.object({
  slug: z.string(),
  type: z.enum(PROVIDER_TYPES),
  available: z.boolean(),
  reason: z.string().optional(),
});

export const ProviderConfigSchema = z.object({
  deepgramApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  preferredLLMProvider: z.enum(LLM_PROVIDER_SLUGS).optional(),
  ollamaBaseUrl: z.string().url().optional().default("http://localhost:11434"),
});

export const ValidateKeySchema = z.object({
  provider: z.enum(["deepgram", "anthropic", "gemini", "openai"]),
  key: z.string().min(1),
});

export const ValidateKeyResponseSchema = z.object({
  valid: z.boolean(),
  provider: z.string(),
  error: z.string().optional(),
});

export type BYOKKey = z.infer<typeof BYOKKeySchema>;
export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;
export type ValidateKeyInput = z.infer<typeof ValidateKeySchema>;
export type ValidateKeyResponse = z.infer<typeof ValidateKeyResponseSchema>;
