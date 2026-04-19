import { z } from "zod";

export const EnvSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DEEPGRAM_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  OLLAMA_BASE_URL: z.string().url().optional().default("http://localhost:11434"),
});

export type Env = z.infer<typeof EnvSchema>;
