/**
 * Friends client — typed Supabase wrappers for the friend system.
 * Pure functions: no React state, no toasts. Errors bubble up via the
 * returned PostgrestError (caller decides how to surface them, normally
 * via handleSupabaseError).
 */

import { supabase } from "../lib/supabase";

export type FriendshipStatus = "pending" | "accepted" | "blocked";

export interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

/** Public-safe slice of a profile — what username search returns. */
export interface UserMatch {
  id: string;
  name: string;
  username: string;
}

/** A friend in our list with the friendship state attached. */
export interface FriendSummary extends UserMatch {
  friendshipId: string;
  /** Did *we* send the original request? */
  initiatedByMe: boolean;
}

// ---------------------------------------------------------------------------
// Send / accept / decline / remove
// ---------------------------------------------------------------------------

export async function sendFriendRequest(addresseeId: string) {
  const { data: session } = await supabase.auth.getUser();
  const meId = session.user?.id;
  if (!meId) throw new Error("Not signed in");

  return supabase.from("friendships").insert({
    requester_id: meId,
    addressee_id: addresseeId,
    status: "pending",
  });
}

export async function acceptFriendRequest(friendshipId: string) {
  return supabase
    .from("friendships")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", friendshipId);
}

export async function declineOrRemoveFriendship(friendshipId: string) {
  return supabase.from("friendships").delete().eq("id", friendshipId);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Returns the set of friendships the current user is part of. Caller
 * decides how to partition them by status / direction.
 */
export async function listFriendships() {
  const { data, error } = await supabase
    .from("friendships")
    .select("*")
    .order("updated_at", { ascending: false });
  return { data: (data ?? []) as FriendshipRow[], error };
}

/**
 * Look up the profile (id/name/username) for a batch of user ids. Used to
 * decorate friendship rows with the other party's display info.
 */
export async function fetchProfilesByIds(ids: string[]) {
  if (ids.length === 0) return { data: [] as UserMatch[], error: null };
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, username")
    .in("id", ids);
  return { data: (data ?? []) as UserMatch[], error };
}

/** Search users by username substring (case-insensitive, >= 2 chars). */
export async function searchUsersByUsername(query: string) {
  const { data, error } = await supabase.rpc("search_users_by_username", { query });
  return { data: (data ?? []) as UserMatch[], error };
}

/**
 * Read another user's collection_items. Requires the owner to have
 * list_visibility='friends' AND an accepted friendship — RLS enforces
 * both, so this just returns an empty list (no error) if not allowed.
 */
export async function fetchFriendItems(friendUserId: string) {
  return supabase
    .from("collection_items")
    .select("*")
    .eq("user_id", friendUserId)
    .order("created_at", { ascending: false });
}
