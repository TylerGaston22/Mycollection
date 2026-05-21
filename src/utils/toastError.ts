/**
 * Shared helper for the `if (error) { toast.error(...); return; }` pattern
 * that the Supabase data hooks repeated in ~19 places.
 *
 * Usage:
 *   const { error } = await supabase.from('...').delete().eq(...);
 *   if (handleSupabaseError('Failed to delete tab', error)) return;
 *
 * Returns true (and toasts) when there's an error so the caller can early
 * return on one line.
 */

import { toast } from "sonner";

interface SupabaseLikeError {
  message: string;
}

export function handleSupabaseError(
  title: string,
  error: SupabaseLikeError | null | undefined,
): boolean {
  if (!error) return false;
  toast.error(title, { description: error.message });
  return true;
}
