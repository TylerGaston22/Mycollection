/**
 * Supabase client – singleton instance used across the app.
 * Reads credentials from VITE_ environment variables set in .env.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing – real auth and persistence will not work.');
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
