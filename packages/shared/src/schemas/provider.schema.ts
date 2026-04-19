import { z } from "zod";
import { PROVIDER_TYPES, LLM_PROVIDER_SLUGS } from "../constants/index.js";

// Payload for storing a user-supplied API key (BYOK flow)
export const BYOKKeySchema = z.object({
  provider: z.enum([
    "deepgram",
    "anthropic",
    "gemini",
    "openai",
    "Ollama",
    "other",
  ]),
  key: z.string().min(1),
});

// Runtime status of a single provider — used by `iprep doctor` and the health endpoint
export const ProviderStatusSchema = z.object({
  slug: z.string(),
  type: z.enum(PROVIDER_TYPES),
  available: z.boolean(),
  reason: z.string().optional(), // human-readable explanation when available is false
});

// Full provider config stored per-session; all keys optional because users may supply only some except for deepgramApiKey, which is required to use core audio processing features
export const ProviderConfigSchema = z.object({
  deepgramApiKey: z.string().trim().min(1),
  anthropicApiKey: z.string().trim().min(1).optional(),
  geminiApiKey: z.string().trim().min(1).optional(),
  openaiApiKey: z.string().trim().min(1).optional(),
  preferredLLMProvider: z.enum(LLM_PROVIDER_SLUGS).optional(),
  ollamaBaseUrl: z.string().url().default("http://localhost:11434"),
});

// Request body for the key-validation endpoint
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
