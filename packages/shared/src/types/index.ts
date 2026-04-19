import type {
  INTERVIEW_PACKAGE_SLUGS,
  TUTOR_SLUGS,
  INTERVIEW_MODES,
  SESSION_STATUSES,
  ANALYSIS_STATUSES,
  PROVIDER_TYPES,
  LLM_PROVIDER_SLUGS,
  STT_PROVIDER_SLUGS,
  TTS_PROVIDER_SLUGS,
  AGENT_PROVIDER_SLUGS,
} from '../constants/index.js';

// --- Derived types from constants ---
// Using `typeof X[number]` turns a const array into a union type
// e.g. TUTOR_SLUGS → "alex" | "priya" | "morgan"

export type InterviewPackageSlug = (typeof INTERVIEW_PACKAGE_SLUGS)[number];
export type TutorSlug = (typeof TUTOR_SLUGS)[number];
export type InterviewMode = (typeof INTERVIEW_MODES)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type AnalysisStatusValue = (typeof ANALYSIS_STATUSES)[number]; // just the string union e.g. "PENDING" | "COMPLETED"
export type ProviderType = (typeof PROVIDER_TYPES)[number];
export type LLMProviderSlug = (typeof LLM_PROVIDER_SLUGS)[number];
export type STTProviderSlug = (typeof STT_PROVIDER_SLUGS)[number];
export type TTSProviderSlug = (typeof TTS_PROVIDER_SLUGS)[number];
export type AgentProviderSlug = (typeof AGENT_PROVIDER_SLUGS)[number];

// --- Provider interfaces ---
// Every provider must implement isAvailable() so the registry
// can skip unavailable ones without crashing

// LLM: handles text analysis of interview transcripts
export interface ILLMProvider {
  readonly slug: LLMProviderSlug;
  readonly type: 'llm';
  isAvailable(): Promise<boolean>;
  analyze(
    transcript: TranscriptEntry[],
  ): Promise<import('../schemas/analysis.schema.js').AnalysisResult>;
}

// STT: speech-to-text (mic audio → text)
export interface ISTTProvider {
  readonly slug: STTProviderSlug;
  readonly type: 'stt';
  isAvailable(): Promise<boolean>;
}

// TTS: text-to-speech (tutor text → audio)
export interface ITTSProvider {
  readonly slug: TTSProviderSlug;
  readonly type: 'tts';
  isAvailable(): Promise<boolean>;
}

// Agent: all-in-one voice agent (STT + LLM + TTS in one WebSocket)
export interface IAgentProvider {
  readonly slug: AgentProviderSlug;
  readonly type: 'agent';
  isAvailable(): Promise<boolean>;
}

// Union of all provider types — useful for registry lookups
export type IAnyProvider = ILLMProvider | ISTTProvider | ITTSProvider | IAgentProvider;

// --- Shared data shapes ---

// One message in the interview conversation
export interface TranscriptEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 8601
}

// Response from GET /health
export interface HealthResponse {
  status: 'ok' | 'error';
  activeSessionCount: number;
  version: string;
  uptime: number; // seconds
}

// Standard error shape returned by all API routes
export interface ApiError {
  error: string;
  code?: string; // machine-readable error code
  details?: unknown;
}
