/**
 * FriendsTab – accepted-friendships list with View / Remove actions.
 * Used by FriendsDialog; extracted so the parent stays a thin
 * orchestrator of the three tabs.
 */

import { Button } from "../components/ui/button";
import { LoadingRow } from "./LoadingRow";
import {
  FRIEND_EMPTY_STATE_CLASS,
  FRIEND_ROW_CLASS,
  FRIEND_ROW_NAME_CLASS,
  FRIEND_ROW_USERNAME_CLASS,
} from "./styles";
import type { FriendSummary } from "./client";
import type { useFriends } from "./useFriends";

interface FriendsTabProps {
  friends: ReturnType<typeof useFriends>;
  onViewFriend: (friend: FriendSummary) => void;
}

export function FriendsTab({ friends, onViewFriend }: FriendsTabProps) {
  if (friends.isLoading) return <LoadingRow />;
  if (friends.friends.length === 0) {
    return <p className={FRIEND_EMPTY_STATE_CLASS}>No friends yet. Use the Find tab to add some.</p>;
  }

  return (
    <div className="space-y-2">
      {friends.friends.map((friend) => (
        <div key={friend.friendshipId} className={FRIEND_ROW_CLASS}>
          <div className="min-w-0 flex-1">
            <p className={FRIEND_ROW_NAME_CLASS}>{friend.name || friend.username}</p>
            <p className={FRIEND_ROW_USERNAME_CLASS}>@{friend.username}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => onViewFriend(friend)}>
              View list
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => friends.remove(friend.friendshipId)}
              className="text-destructive hover:text-destructive"
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
