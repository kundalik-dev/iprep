import { z } from 'zod';

// Single source of truth for all env vars — used by both server and CLI via @iprep/shared
export const EnvSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'), // comma-separated list for CORS
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // BYOK — all AI keys are optional; provider fallback chain picks the first available
  DEEPGRAM_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Ollama runs locally — only needed when using self-hosted models
  OLLAMA_BASE_URL: z.string().url().optional().default('http://localhost:11434'),
});

export type Env = z.infer<typeof EnvSchema>;
