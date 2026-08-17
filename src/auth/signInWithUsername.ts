/**
 * signInWithUsername – sign in with a bare username via the `signin`
 * Edge Function.
 *
 * Only reached when the direct attempt in useAuth has already failed, i.e.
 * the identifier isn't an email and isn't a username-only account's
 * synthetic address. That leaves accounts that signed up with a real email
 * and later claimed a username — resolving those requires reading the
 * username → email mapping, which the browser deliberately cannot do.
 *
 * Returns a plain boolean, never the resolved address or a reason. The
 * caller has no way to distinguish "no such username" from "wrong
 * password", which is the point: see supabase/functions/signin/index.ts.
 *
 * Requires the Edge Function to be deployed. When it isn't, invoke fails
 * and this returns false, which lands the user on the same generic error
 * they'd have seen before this path existed — no crash, no regression.
 */

import { supabase } from "../lib/supabase";

export async function signInWithUsername(
  identifier: string,
  password: string,
): Promise<boolean> {
  const trimmed = identifier.trim();
  if (!trimmed || !password) return false;

  let response;
  try {
    response = await supabase.functions.invoke("signin", {
      body: { identifier: trimmed, password },
    });
  } catch {
    // Network failure, function not deployed, CORS — all indistinguishable
    // from bad credentials as far as the user is concerned.
    return false;
  }

  if (response.error) return false;

  const session = response.data?.session;
  if (!session?.access_token || !session?.refresh_token) return false;

  // The function signs in on the server; the browser still needs the
  // tokens installed locally so supabase-js treats this as a live session
  // and the onAuthStateChange listener in useAuth fires as usual.
  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  return !error;
}
