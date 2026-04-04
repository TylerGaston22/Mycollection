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
);
