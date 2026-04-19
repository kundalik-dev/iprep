import os from "os";
import path from "path";

export const APP_NAME = "iprep";
export const APP_VERSION = "0.0.1";

export const DEFAULT_PORT = 3000;
export const DEFAULT_WS_PORT = 3001;
export const DEFAULT_FRONTEND_PORT = 5173;

export const IPREP_HOME = path.join(os.homedir(), ".iprep");
export const IPREP_DB_DIR = path.join(IPREP_HOME, "db");
export const IPREP_DB_PATH = path.join(IPREP_DB_DIR, "iprep.db");
export const IPREP_SESSIONS_FILE = path.join(IPREP_HOME, "sessions.json");
export const IPREP_BACKUPS_DIR = path.join(IPREP_HOME, "backups");
export const IPREP_KEYS_FILE = path.join(IPREP_HOME, ".keys");

export const INTERVIEW_PACKAGE_SLUGS = [
  "behavioral",
  "technical",
  "system-design",
  "dsa",
  "hr",
  "pm",
] as const;

export const TUTOR_SLUGS = ["alex", "priya", "morgan"] as const;

export const INTERVIEW_MODES = ["voice", "text"] as const;

export const SESSION_STATUSES = [
  "ACTIVE",
  "ENDED",
  "ANALYZING",
  "ANALYZED",
  "FAILED",
] as const;

export const ANALYSIS_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
] as const;

export const PROVIDER_TYPES = ["llm", "stt", "tts", "agent"] as const;

export const LLM_PROVIDER_SLUGS = [
  "gemini-free",
  "gemini-api",
  "claude-cli",
  "gemini-cli",
  "codex-cli",
  "ollama",
  "claude-api",
  "openai-api",
] as const;

export const STT_PROVIDER_SLUGS = ["deepgram", "openai-whisper"] as const;

export const TTS_PROVIDER_SLUGS = ["deepgram", "openai-tts"] as const;

export const AGENT_PROVIDER_SLUGS = ["deepgram-agent"] as const;
