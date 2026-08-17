/**
 * supabaseConfig – pure helpers for checking whether the Supabase env
 * vars are actually present.
 *
 * Kept out of lib/supabase.ts so it can be unit-tested without importing
 * that module, which calls createClient() at import time.
 */

export const REQUIRED_SUPABASE_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

/**
 * Names of the required vars that are absent, empty, or whitespace-only.
 * Empty array means configured.
 *
 * Whitespace counts as missing on purpose: a `.env` copied from
 * .env.example and left as `VITE_SUPABASE_URL=` produces `''`, which is
 * just as broken as the var not being there at all.
 */
export function findMissingEnvVars(env: Record<string, string | undefined>): string[] {
  return REQUIRED_SUPABASE_ENV_VARS.filter((name) => {
    const value = env[name];
    if (!value) return true;
    return value.trim().length === 0;
  });
}
