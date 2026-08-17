/**
 * Supabase client – singleton instance used across the app.
 * Reads credentials from VITE_ environment variables set in .env.
 */

import { createClient } from '@supabase/supabase-js';
import { findMissingEnvVars } from '../utils/supabaseConfig';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Required env vars that are absent or empty. Empty array = configured.
 *
 * Exported so the UI can say so at startup. Without a visible signal, a
 * missing .env is indistinguishable from a deleted feature: every write
 * fails, handleSupabaseError swallows it, and the calling hook returns
 * null, so the app just… does nothing. See docs/errors.md ("A missing
 * .env makes finished features look deleted").
 */
export const missingSupabaseEnvVars = findMissingEnvVars({
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
});

export const isSupabaseConfigured = missingSupabaseEnvVars.length === 0;

if (!isSupabaseConfigured) {
  console.warn(
    `Supabase credentials missing (${missingSupabaseEnvVars.join(', ')}) – real auth and persistence will not work.`,
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // No-op lock: supabase-js defaults to navigator.locks to serialize
      // auth across tabs, but in Codespaces dev tunnels the lock can be
      // acquired and never released, causing signInWithPassword to hang
      // after the HTTP response comes back. We don't need cross-tab
      // coordination here, so just run the callback directly.
      lock: async (_name, _acquireTimeout, fn) => await fn(),
    },
  },
);
