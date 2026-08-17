/**
 * signin – Edge Function that lets a user sign in with EITHER their email
 * or their username, without ever disclosing one to the other.
 *
 * Why this exists as a server-side function rather than a lookup the
 * browser can do:
 *
 *   Resolving "username → email" in the client requires the client to be
 *   able to READ that mapping, which turns the app into an email-harvesting
 *   endpoint — probe usernames, collect addresses. Doing the resolution AND
 *   the sign-in here means the address never crosses the wire. The browser
 *   sends an identifier and a password; it gets back a session or a generic
 *   failure. It never learns whether the identifier existed.
 *
 * That "generic failure" is load-bearing. Every failure path below returns
 * the SAME message and the SAME status. A different message for "no such
 * user" versus "wrong password" would hand back exactly the enumeration
 * oracle this function is built to avoid.
 *
 * Deploy:  supabase functions deploy signin
 * Secrets: none to set — SUPABASE_URL, SUPABASE_ANON_KEY and
 *          SUPABASE_SERVICE_ROLE_KEY are injected by the platform.
 *
 * The service-role key is what makes the lookup possible; it must never
 * leave this function. It is not a VITE_ var and must not become one.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Keep in sync with SYNTHETIC_EMAIL_DOMAIN in src/auth/username.ts.
const SYNTHETIC_EMAIL_DOMAIN = 'no-email.mycollection.local';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** One message for every failure. See the note at the top of this file. */
const GENERIC_FAILURE = 'Invalid login credentials';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function failure(): Response {
  return jsonResponse({ error: GENERIC_FAILURE }, 401);
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    // A misconfigured deploy is our fault, not a credential problem, so
    // this one is allowed to be specific — it leaks nothing about users.
    return jsonResponse({ error: 'Auth function is not configured' }, 500);
  }

  let identifier: unknown;
  let password: unknown;
  try {
    const body = await req.json();
    identifier = body?.identifier;
    password = body?.password;
  } catch {
    return jsonResponse({ error: 'Malformed request body' }, 400);
  }

  if (typeof identifier !== 'string' || typeof password !== 'string') {
    return jsonResponse({ error: 'identifier and password are required' }, 400);
  }

  const trimmedIdentifier = identifier.trim();
  if (!trimmedIdentifier || !password) return failure();

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = await resolveEmail(admin, trimmedIdentifier);
  if (!email) return failure();

  // Sign in with the ANON key, not the service-role client: we want a
  // normal user session subject to RLS, not an elevated one.
  const anon = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) return failure();

  return jsonResponse({ session: data.session }, 200);
});

/**
 * Map a sign-in identifier to the address Supabase Auth knows this user by.
 * Returns null when it can't be resolved — callers must treat that exactly
 * like a wrong password.
 */
async function resolveEmail(
  // deno-lint-ignore no-explicit-any
  admin: any,
  identifier: string,
): Promise<string | null> {
  // Contains '@' → already an email. Passed through untouched; a wrong
  // address just fails the password check below like any other bad input.
  if (identifier.includes('@')) return identifier;

  const username = identifier.toLowerCase();

  // profiles.username is stored lowercased with a case-insensitive unique
  // index (supabase/username_constraints.sql), so an exact match on the
  // lowercased input is both correct and index-backed. Empty usernames are
  // excluded — several legacy rows share '' and must never be matchable.
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('username', '')
    .maybeSingle();

  if (profile?.id) {
    const { data: userResult } = await admin.auth.admin.getUserById(profile.id);
    const foundEmail = userResult?.user?.email;
    if (foundEmail) return foundEmail;
  }

  // Fallback for username-only accounts: their auth identifier IS the
  // synthetic address, so this resolves even if their profile row is
  // missing (e.g. the handle_new_user trigger failed at signup).
  return `${username}@${SYNTHETIC_EMAIL_DOMAIN}`;
}
