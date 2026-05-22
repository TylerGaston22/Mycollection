/**
 * Recommendations client — typed Supabase wrappers.
 * Pure functions: no React state, no toasts. Errors bubble up via the
 * returned PostgrestError; callers decide how to surface them
 * (normally via handleSupabaseError).
 */

import { supabase } from "../lib/supabase";
import type { Item } from "../types";

export type RecommendationStatus = "pending" | "added" | "dismissed";

/**
 * Snapshot of the recommended item. Subset of Item — only the fields
 * worth carrying forward so the recipient can recreate it in their
 * own collection. `title` is the only required field; the rest are
 * optional because they may not exist on every item kind.
 */
export interface ItemSnapshot {
  title: string;
  type: string;
  year?: string;
  posterUrl?: string;
  genre?: string;
  platform?: string;
  studio?: string;
  seasons?: number;
  episodes?: number;
  notes?: string;
}

export interface RecommendationRow {
  id: string;
  from_user_id: string;
  to_user_id: string;
  item_snapshot: ItemSnapshot;
  note: string | null;
  status: RecommendationStatus;
  created_at: string;
  updated_at: string;
}

/** Convert a full collection Item into the snapshot shape stored in jsonb. */
export function itemToSnapshot(item: Item): ItemSnapshot {
  return {
    title: item.title,
    type: item.type,
    year: item.year,
    posterUrl: item.posterUrl,
    genre: item.genre,
    platform: item.platform,
    studio: item.studio,
    seasons: item.seasons,
    episodes: item.episodes,
    notes: item.notes,
  };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function sendRecommendation(args: {
  toUserId: string;
  item: Item;
  note?: string;
}) {
  const { data: session } = await supabase.auth.getUser();
  const meId = session.user?.id;
  if (!meId) throw new Error("Not signed in");

  return supabase.from("recommendations").insert({
    from_user_id: meId,
    to_user_id: args.toUserId,
    item_snapshot: itemToSnapshot(args.item),
    note: args.note?.trim() || null,
    status: "pending",
  });
}

export async function markRecommendationStatus(
  recommendationId: string,
  status: Exclude<RecommendationStatus, "pending">,
) {
  return supabase
    .from("recommendations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", recommendationId);
}

export async function deleteRecommendation(recommendationId: string) {
  return supabase.from("recommendations").delete().eq("id", recommendationId);
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Returns the full set of recommendations the current user is part of
 * (incoming + outgoing in any status). Caller filters by direction/status.
 * RLS limits the query to rows where the user is sender or recipient.
 */
export async function listRecommendations() {
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: (data ?? []) as RecommendationRow[], error };
}
