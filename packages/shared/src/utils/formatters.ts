// Returns ISO 8601 string (UTC) — use for storage and API payloads
export function formatDate(date: string | number | Date): string {
  return new Date(date).toISOString();
}

// Returns locale-aware string — use for display only, not storage
export function formatTimestamp(date: string | number | Date): string {
  return new Date(date).toLocaleString();
}

// Appends ellipsis only when text exceeds maxLength
export function truncate(text: string, maxLength = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// 🚫 check for what this used.
// Combines epoch ms + 6-char base-36 suffix for collision resistance
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Strips non-word chars after lowercasing and collapsing spaces to hyphens
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}
