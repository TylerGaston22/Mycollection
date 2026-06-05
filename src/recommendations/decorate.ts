/**
 * Pure helpers for shaping recommendation data — kept out of the
 * useRecommendations hook so they can be unit-tested without React.
 */

import type { UserMatch } from "../friends/client";
import type { DecoratedRecommendation } from "./useRecommendations";
import type { RecommendationRow } from "./client";

/**
 * Pick the "other party" of a recommendation relative to the current
 * user — sender for incoming rows, recipient for outgoing rows.
 */
export function otherPartyUserId(row: RecommendationRow, currentUserId: string): string {
  return row.from_user_id === currentUserId ? row.to_user_id : row.from_user_id;
}

/**
 * Given the full set of recommendation rows and the current user's id,
 * return the de-duplicated list of OTHER-party user ids whose profiles
 * we need to fetch in a single batch. Order is insertion order from
 * the input rows (Set preserves first-encounter order).
 */
export function collectOtherPartyIds(rows: RecommendationRow[], currentUserId: string): string[] {
  return Array.from(new Set(rows.map((row) => otherPartyUserId(row, currentUserId))));
}

/**
 * Attach the other party's profile (or null if unknown) to a single
 * recommendation row.
 */
export function decorateRecommendation(
  row: RecommendationRow,
  currentUserId: string,
  profilesById: Map<string, UserMatch>,
): DecoratedRecommendation {
  return {
    ...row,
    otherParty: profilesById.get(otherPartyUserId(row, currentUserId)) ?? null,
  };
}
