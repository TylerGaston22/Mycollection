/**
 * Username helpers for the "username-only signup" flow.
 *
 * Supabase Auth requires an email as the canonical identifier, so for users
 * who only want a username we synthesise one: `<username>@<DOMAIN>`. The
 * domain is intentionally unreachable so no real mail can ever land there.
 *
 * Everything is lowercased; the database stores usernames lowercased and
 * has a case-insensitive unique index on `profiles.username`.
 */

import { DEMO_CREDENTIALS } from "../demo";

export const SYNTHETIC_EMAIL_DOMAIN = "no-email.mycollection.local";

const USERNAME_PATTERN = /^[a-z0-9_-]+$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 30;

/** Reserved usernames that can't be signed up with. */
const RESERVED_USERNAMES = new Set<string>([
  DEMO_CREDENTIALS.username, // 'demo' — used by the demo-login shortcut
  "admin",
  "root",
  "system",
  "support",
]);

export interface UsernameValidationResult {
  ok: boolean;
  /** Human-readable reason, only set when ok is false. */
  error?: string;
}

/**
 * Validate a username for sign-up. Returns the normalised (lowercased)
 * username when valid, or an error message when not.
 */
export function validateUsername(raw: string): UsernameValidationResult {
  const username = raw.trim().toLowerCase();

  if (!username) return { ok: false, error: "Username is required." };

  if (username.length < USERNAME_MIN) {
    return { ok: false, error: `Username must be at least ${USERNAME_MIN} characters.` };
  }
  if (username.length > USERNAME_MAX) {
    return { ok: false, error: `Username must be at most ${USERNAME_MAX} characters.` };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "Username can only contain lowercase letters, numbers, dashes, and underscores.",
    };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { ok: false, error: `"${username}" is reserved. Pick a different username.` };
  }

  return { ok: true };
}

/** Build the synthetic email used as a Supabase Auth identifier. */
export function usernameToSyntheticEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

/** Detect whether an email is one of our synthetic addresses. */
export function isSyntheticEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${SYNTHETIC_EMAIL_DOMAIN}`);
}

/**
 * Decide whether a sign-in identifier is an email or a username.
 * Heuristic: if it contains '@' we treat it as an email and pass it to
 * Supabase Auth as-is; otherwise we map it to its synthetic email.
 */
export function resolveSignInEmail(identifier: string): string {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) return trimmed;
  return usernameToSyntheticEmail(trimmed);
}
