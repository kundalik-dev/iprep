// App identity
export const APP_NAME = 'iprep';
export const APP_VERSION = '0.0.1';

// Default ports for each service
export const DEFAULT_PORT = 3000; // server port
export const DEFAULT_WS_PORT = 3001; // WebSocket port for real-time communication
export const DEFAULT_FRONTEND_PORT = 5173; // Vite dev server port for frontend (only used in development)

// Valid interview package types
export const INTERVIEW_PACKAGE_SLUGS = [
  'behavioral',
  'technical',
  'system-design',
  'dsa',
  'hr',
  'pm',
] as const;

// Available AI tutors
export const TUTOR_SLUGS = ['alex', 'priya', 'morgan'] as const;

// Interview can be voice or text
export const INTERVIEW_MODES = ['voice', 'text'] as const;

// Lifecycle states of a interview session
export const SESSION_STATUSES = ['ACTIVE', 'ENDED', 'ANALYZING', 'ANALYZED', 'FAILED'] as const;

// Lifecycle states of an analysis job
export const ANALYSIS_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] as const;

// Categories of providers
export const PROVIDER_TYPES = ['llm', 'stt', 'tts', 'agent'] as const;

// LLM providers ordered cheapest → most expensive (fallback chain order)
export const LLM_PROVIDER_SLUGS = [
  'gemini-free',
  'gemini-api',
  'claude-cli',
  'gemini-cli',
  'codex-cli',
  'ollama',
  'claude-api',
  'openai-api',
] as const;

// Speech-to-text providers
export const STT_PROVIDER_SLUGS = ['deepgram', 'openai-whisper'] as const;

// Text-to-speech providers
export const TTS_PROVIDER_SLUGS = ['deepgram', 'openai-tts'] as const;

// Voice agent providers (handles STT + TTS + LLM together)
export const AGENT_PROVIDER_SLUGS = ['deepgram-agent'] as const;
