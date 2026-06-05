/**
 * RequestsTab – pending friend requests in two sections (Incoming and
 * Pending sent). Accept / Decline (incoming) or Cancel (outgoing).
 */

import { Button } from "../components/ui/button";
import { LoadingRow } from "./LoadingRow";
import {
  FRIEND_EMPTY_STATE_CLASS,
  FRIEND_ROW_CLASS,
  FRIEND_ROW_NAME_CLASS,
  FRIEND_ROW_USERNAME_CLASS,
} from "./styles";
import type { useFriends } from "./useFriends";

interface RequestsTabProps {
  friends: ReturnType<typeof useFriends>;
}

export function RequestsTab({ friends }: RequestsTabProps) {
  if (friends.isLoading) return <LoadingRow />;

  const hasIncoming = friends.incomingRequests.length > 0;
  const hasOutgoing = friends.outgoingRequests.length > 0;

  if (!hasIncoming && !hasOutgoing) {
    return <p className={FRIEND_EMPTY_STATE_CLASS}>No pending requests.</p>;
  }

  return (
    <div className="space-y-5">
      {hasIncoming && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Incoming ({friends.incomingRequests.length})
          </p>
          {friends.incomingRequests.map((req) => (
            <div key={req.friendshipId} className={FRIEND_ROW_CLASS}>
              <div className="min-w-0 flex-1">
                <p className={FRIEND_ROW_NAME_CLASS}>{req.name || req.username}</p>
                <p className={FRIEND_ROW_USERNAME_CLASS}>@{req.username}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" onClick={() => friends.accept(req.friendshipId)}>
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => friends.decline(req.friendshipId)}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasOutgoing && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Pending sent ({friends.outgoingRequests.length})
          </p>
          {friends.outgoingRequests.map((req) => (
            <div key={req.friendshipId} className={FRIEND_ROW_CLASS}>
              <div className="min-w-0 flex-1">
                <p className={FRIEND_ROW_NAME_CLASS}>{req.name || req.username}</p>
                <p className={FRIEND_ROW_USERNAME_CLASS}>@{req.username}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => friends.decline(req.friendshipId)}
                className="text-destructive hover:text-destructive flex-shrink-0"
              >
                Cancel
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
