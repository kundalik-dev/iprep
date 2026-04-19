import type { INTERVIEW_PACKAGE_SLUGS, TUTOR_SLUGS, INTERVIEW_MODES, SESSION_STATUSES, ANALYSIS_STATUSES, PROVIDER_TYPES, LLM_PROVIDER_SLUGS, STT_PROVIDER_SLUGS, TTS_PROVIDER_SLUGS, AGENT_PROVIDER_SLUGS } from "../constants/index.js";

export type InterviewPackageSlug = (typeof INTERVIEW_PACKAGE_SLUGS)[number];
export type TutorSlug = (typeof TUTOR_SLUGS)[number];
export type InterviewMode = (typeof INTERVIEW_MODES)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type AnalysisStatus = (typeof ANALYSIS_STATUSES)[number];
export type ProviderType = (typeof PROVIDER_TYPES)[number];
export type LLMProviderSlug = (typeof LLM_PROVIDER_SLUGS)[number];
export type STTProviderSlug = (typeof STT_PROVIDER_SLUGS)[number];
export type TTSProviderSlug = (typeof TTS_PROVIDER_SLUGS)[number];
export type AgentProviderSlug = (typeof AGENT_PROVIDER_SLUGS)[number];

export interface ILLMProvider {
  readonly slug: LLMProviderSlug;
  readonly type: "llm";
  isAvailable(): Promise<boolean>;
  analyze(transcript: TranscriptEntry[]): Promise<import("../schemas/analysis.schema.js").AnalysisResult>;
}

export interface ISTTProvider {
  readonly slug: STTProviderSlug;
  readonly type: "stt";
  isAvailable(): Promise<boolean>;
}

export interface ITTSProvider {
  readonly slug: TTSProviderSlug;
  readonly type: "tts";
  isAvailable(): Promise<boolean>;
}

export interface IAgentProvider {
  readonly slug: AgentProviderSlug;
  readonly type: "agent";
  isAvailable(): Promise<boolean>;
}

export type IAnyProvider = ILLMProvider | ISTTProvider | ITTSProvider | IAgentProvider;

export interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface HealthResponse {
  status: "ok" | "error";
  activeSessionCount: number;
  version: string;
  uptime: number;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}
