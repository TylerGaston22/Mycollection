/**
 * useRecommendations – React hook that owns the recommendation state.
 *
 * Two buckets:
 *   - incoming: recommendations sent TO me, decorated with sender's
 *               profile (name + username) so the UI can render
 *               "from @alice".
 *   - outgoing: recommendations I've SENT (any status).
 *
 * Mutations: send, accept (status='added' + add to collection),
 * dismiss (status='dismissed'), remove (hard delete).
 *
 * Demo users get an empty hook (recommendations are Supabase-only,
 * same pattern as useFriends).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { handleSupabaseError } from "../utils/toastError";
import { fetchProfilesByIds, type UserMatch } from "../friends/client";
import {
  deleteRecommendation,
  listRecommendations,
  markRecommendationStatus,
  sendRecommendation,
  type RecommendationRow,
} from "./client";
import type { Item } from "../types";
import type { ItemStatus } from "../constants";

export interface DecoratedRecommendation extends RecommendationRow {
  /** Other party's profile (sender for incoming, recipient for outgoing). */
  otherParty: UserMatch | null;
}

interface UseRecommendationsState {
  incoming: DecoratedRecommendation[];
  outgoing: DecoratedRecommendation[];
  isLoading: boolean;
}

export interface AcceptOptions {
  /** Defaults to 'want-to-see'. */
  status?: ItemStatus;
  /** Custom section IDs to drop the item into. Defaults to none. */
  sections?: string[];
}

interface UseRecommendationsActions {
  send: (args: { toUserId: string; item: Item; note?: string }) => Promise<boolean>;
  accept: (recommendation: DecoratedRecommendation, options?: AcceptOptions) => Promise<boolean>;
  dismiss: (recommendationId: string) => Promise<boolean>;
  remove: (recommendationId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const EMPTY_STATE: UseRecommendationsState = {
  incoming: [],
  outgoing: [],
  isLoading: false,
};

/**
 * @param currentUserId          Auth uid of the signed-in user.
 * @param isDemoUser             Skip all Supabase calls for the demo account.
 * @param addItemToCollection    Callback the hook invokes after a recipient
 *                               accepts a recommendation. The hook itself
 *                               doesn't know how to add to your collection
 *                               (that's the data layer's job) — it just
 *                               hands the Item-shape over.
 */
export function useRecommendations(
  currentUserId: string,
  isDemoUser: boolean,
  addItemToCollection?: (item: Omit<Item, "id">) => void,
): UseRecommendationsState & UseRecommendationsActions {
  const [state, setState] = useState<UseRecommendationsState>(EMPTY_STATE);

  const refresh = useCallback(async (): Promise<void> => {
    if (isDemoUser || !currentUserId) {
      setState(EMPTY_STATE);
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true }));

    const { data: rows, error } = await listRecommendations();
    if (handleSupabaseError("Failed to load recommendations", error)) {
      setState({ ...EMPTY_STATE, isLoading: false });
      return;
    }

    const otherIds = Array.from(
      new Set(
        rows.map((row) =>
          row.from_user_id === currentUserId ? row.to_user_id : row.from_user_id,
        ),
      ),
    );
    const { data: profiles, error: profilesError } = await fetchProfilesByIds(otherIds);
    if (handleSupabaseError("Failed to load recommender profiles", profilesError)) {
      setState({ ...EMPTY_STATE, isLoading: false });
      return;
    }
    const profilesById = new Map(profiles.map((p) => [p.id, p]));

    const decorate = (row: RecommendationRow): DecoratedRecommendation => {
      const otherId = row.from_user_id === currentUserId ? row.to_user_id : row.from_user_id;
      return { ...row, otherParty: profilesById.get(otherId) ?? null };
    };

    setState({
      incoming: rows
        .filter((r) => r.to_user_id === currentUserId)
        .map(decorate),
      outgoing: rows
        .filter((r) => r.from_user_id === currentUserId)
        .map(decorate),
      isLoading: false,
    });
  }, [currentUserId, isDemoUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const send = useCallback(
    async (args: { toUserId: string; item: Item; note?: string }): Promise<boolean> => {
      const { error } = await sendRecommendation(args);
      if (error) {
        const isDuplicate = /duplicate|unique|already/i.test(error.message);
        toast.error("Couldn't send recommendation", {
          description: isDuplicate
            ? "You've already recommended this item to that friend."
            : error.message,
        });
        return false;
      }
      toast.success("Recommendation sent");
      await refresh();
      return true;
    },
    [refresh],
  );

  const accept = useCallback(
    async (recommendation: DecoratedRecommendation, options?: AcceptOptions): Promise<boolean> => {
      const { error } = await markRecommendationStatus(recommendation.id, "added");
      if (handleSupabaseError("Couldn't accept recommendation", error)) return false;
      // Materialise the snapshot into the recipient's collection, using the
      // recipient's picker choices (status / custom sections) — falling back
      // to sensible defaults so a one-click accept still works.
      if (addItemToCollection) {
        const s = recommendation.item_snapshot;
        addItemToCollection({
          title: s.title,
          type: s.type,
          year: s.year,
          posterUrl: s.posterUrl,
          genre: s.genre,
          platform: s.platform,
          studio: s.studio,
          seasons: s.seasons,
          episodes: s.episodes,
          notes: s.notes,
          status: options?.status ?? "want-to-see",
          favorite: false,
          sections: options?.sections && options.sections.length > 0 ? options.sections : undefined,
        });
      }
      toast.success("Added to your collection");
      await refresh();
      return true;
    },
    [refresh, addItemToCollection],
  );

  const dismiss = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      const { error } = await markRecommendationStatus(recommendationId, "dismissed");
      if (handleSupabaseError("Couldn't dismiss recommendation", error)) return false;
      await refresh();
      return true;
    },
    [refresh],
  );

  const remove = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      const { error } = await deleteRecommendation(recommendationId);
      if (handleSupabaseError("Couldn't delete recommendation", error)) return false;
      await refresh();
      return true;
    },
    [refresh],
  );

  // useMemo so callers can stable-include the actions in deps without
  // triggering rerenders on every state change.
  return useMemo(
    () => ({ ...state, send, accept, dismiss, remove, refresh }),
    [state, send, accept, dismiss, remove, refresh],
  );
}
