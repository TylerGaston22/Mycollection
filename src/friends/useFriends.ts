/**
 * useFriends – React hook that owns the friend-system state.
 *
 * Returns three buckets:
 *   - friends:        accepted friendships (with the other party's profile)
 *   - incomingRequests: pending requests addressed to me
 *   - outgoingRequests: pending requests I sent
 *
 * Plus the mutations: send, accept, decline, remove. Each mutation refreshes
 * the local state on success and surfaces failures via toast.
 *
 * Demo users get an empty hook (no Supabase calls); the friend feature is
 * Supabase-only.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { handleSupabaseError } from "../utils/toastError";
import {
  acceptFriendRequest,
  declineOrRemoveFriendship,
  fetchProfilesByIds,
  listFriendships,
  sendFriendRequest,
  type FriendSummary,
  type FriendshipRow,
  type UserMatch,
} from "./client";

interface UseFriendsState {
  friends: FriendSummary[];
  incomingRequests: FriendSummary[];
  outgoingRequests: FriendSummary[];
  isLoading: boolean;
}

interface UseFriendsActions {
  send: (addresseeId: string) => Promise<boolean>;
  accept: (friendshipId: string) => Promise<boolean>;
  decline: (friendshipId: string) => Promise<boolean>;
  remove: (friendshipId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const EMPTY_STATE: UseFriendsState = {
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  isLoading: false,
};

/**
 * Decorate raw friendship rows with the other party's profile and the
 * "did I initiate this?" flag.
 */
function decorate(
  rows: FriendshipRow[],
  meId: string,
  profilesById: Map<string, UserMatch>,
): FriendSummary[] {
  return rows
    .map((row) => {
      const otherId = row.requester_id === meId ? row.addressee_id : row.requester_id;
      const profile = profilesById.get(otherId);
      if (!profile) return null;
      return {
        ...profile,
        friendshipId: row.id,
        initiatedByMe: row.requester_id === meId,
      };
    })
    .filter((value): value is FriendSummary => value !== null);
}

export function useFriends(currentUserId: string, isDemoUser: boolean): UseFriendsState & UseFriendsActions {
  const [state, setState] = useState<UseFriendsState>(EMPTY_STATE);

  const refresh = useCallback(async (): Promise<void> => {
    if (isDemoUser || !currentUserId) {
      setState(EMPTY_STATE);
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true }));

    const { data: rows, error } = await listFriendships();
    if (handleSupabaseError("Failed to load friends", error)) {
      setState({ ...EMPTY_STATE, isLoading: false });
      return;
    }

    // Batch-fetch the other party's profile for each friendship.
    const otherIds = Array.from(
      new Set(
        rows.map((row) =>
          row.requester_id === currentUserId ? row.addressee_id : row.requester_id,
        ),
      ),
    );
    const { data: profiles, error: profilesError } = await fetchProfilesByIds(otherIds);
    if (handleSupabaseError("Failed to load friend profiles", profilesError)) {
      setState({ ...EMPTY_STATE, isLoading: false });
      return;
    }
    const profilesById = new Map(profiles.map((p) => [p.id, p]));

    const accepted = rows.filter((r) => r.status === "accepted");
    const pending = rows.filter((r) => r.status === "pending");

    setState({
      friends: decorate(accepted, currentUserId, profilesById),
      incomingRequests: decorate(
        pending.filter((r) => r.addressee_id === currentUserId),
        currentUserId,
        profilesById,
      ),
      outgoingRequests: decorate(
        pending.filter((r) => r.requester_id === currentUserId),
        currentUserId,
        profilesById,
      ),
      isLoading: false,
    });
  }, [currentUserId, isDemoUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const send = useCallback(
    async (addresseeId: string): Promise<boolean> => {
      const { error } = await sendFriendRequest(addresseeId);
      if (error) {
        // Friendly message for the most common case (already requested / friends)
        const isDuplicate = /duplicate|unique|already/i.test(error.message);
        toast.error("Couldn't send friend request", {
          description: isDuplicate
            ? "You already have a pending request or existing friendship with this user."
            : error.message,
        });
        return false;
      }
      toast.success("Friend request sent");
      await refresh();
      return true;
    },
    [refresh],
  );

  const accept = useCallback(
    async (friendshipId: string): Promise<boolean> => {
      const { error } = await acceptFriendRequest(friendshipId);
      if (handleSupabaseError("Couldn't accept request", error)) return false;
      toast.success("Friend request accepted");
      await refresh();
      return true;
    },
    [refresh],
  );

  const decline = useCallback(
    async (friendshipId: string): Promise<boolean> => {
      const { error } = await declineOrRemoveFriendship(friendshipId);
      if (handleSupabaseError("Couldn't decline request", error)) return false;
      await refresh();
      return true;
    },
    [refresh],
  );

  const remove = useCallback(
    async (friendshipId: string): Promise<boolean> => {
      const { error } = await declineOrRemoveFriendship(friendshipId);
      if (handleSupabaseError("Couldn't remove friend", error)) return false;
      toast.success("Friend removed");
      await refresh();
      return true;
    },
    [refresh],
  );

  return { ...state, send, accept, decline, remove, refresh };
}
