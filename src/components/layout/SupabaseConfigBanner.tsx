/**
 * SupabaseConfigBanner – fixed top warning shown when the Supabase env
 * vars are missing.
 *
 * Deliberately persistent and non-dismissible: this is a broken install,
 * not a notice. A toast would scroll away and leave the user with an app
 * whose every write silently no-ops (see docs/errors.md — "A missing
 * .env makes finished features look deleted", todo U).
 *
 * Renders null when configured, so App can mount it unconditionally.
 */

import { AlertTriangle } from 'lucide-react';
import { missingSupabaseEnvVars } from '../../lib/supabase';

export function SupabaseConfigBanner() {
  if (missingSupabaseEnvVars.length === 0) return null;

  return (
    <div
      role="alert"
      // z-50 clears the sidebar (z-40) so it stays visible over the shell.
      className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white px-4 py-2.5 shadow-lg"
    >
      <div className="flex items-start gap-2.5 max-w-4xl mx-auto">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="text-sm">
          <span className="font-semibold">Supabase isn&apos;t configured.</span>{' '}
          Sign-in and saving are disabled — adding categories, subcategories,
          and items will appear to do nothing.
          <div className="mt-1 text-white/90">
            Missing:{' '}
            {missingSupabaseEnvVars.map((name) => (
              <code key={name} className="bg-black/25 rounded px-1 py-0.5 mr-1">
                {name}
              </code>
            ))}
          </div>
          <div className="mt-1 text-white/90">
            Copy <code className="bg-black/25 rounded px-1 py-0.5">.env.example</code> to{' '}
            <code className="bg-black/25 rounded px-1 py-0.5">.env</code>, fill in the values
            from your Supabase dashboard (Settings → API for the key, Settings → Data API for
            the URL), then restart the dev server.
          </div>
        </div>
      </div>
    </div>
  );
}
