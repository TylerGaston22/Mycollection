/**
 * FriendsDialog – three-tab dialog over the useFriends hook.
 *   - Friends  : accepted friendships; can view list / remove
 *   - Requests : incoming (accept / decline) + outgoing (cancel)
 *   - Find     : username search + send request
 *
 * Opens a nested FriendListView when the user clicks "View list" on
 * one of their accepted friends.
 */

import { useEffect, useState } from "react";
import { Users, UserPlus, Inbox, Loader2, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { NotificationBadge } from "../components/ui/NotificationBadge";
import { searchUsersByUsername, type FriendSummary, type UserMatch } from "./client";
import { NAVY_SURFACE_BACKGROUND } from "../utils/surfaceBackgrounds";
import { RecommendationsTab } from "../recommendations/RecommendationsTab";
import type { useRecommendations } from "../recommendations/useRecommendations";
import type { useFriends } from "./useFriends";
import { FriendListView } from "./FriendListView";
import {
  FRIEND_EMPTY_STATE_CLASS,
  FRIEND_INPUT_CLASS,
  FRIEND_ROW_CLASS,
  FRIEND_ROW_NAME_CLASS,
  FRIEND_ROW_USERNAME_CLASS,
  FRIEND_TAB_TRIGGER_CLASS,
} from "./styles";

interface FriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friends: ReturnType<typeof useFriends>;
  recommendations: ReturnType<typeof useRecommendations>;
  /** Demo users can open the dialog but every action is gated to a friendly message. */
  isDemoUser: boolean;
}

export function FriendsDialog({
  open,
  onOpenChange,
  friends,
  recommendations,
  isDemoUser,
}: FriendsDialogProps) {
  const [viewingFriend, setViewingFriend] = useState<FriendSummary | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto text-white border-white/10 [&_[data-slot=dialog-description]]:text-white/70"
        style={{ background: NAVY_SURFACE_BACKGROUND }}
      >
        <DialogHeader>
          <DialogTitle>Friends</DialogTitle>
          <DialogDescription>
            {isDemoUser
              ? "Friends are a real-account feature — sign in (or sign up) to use them."
              : "Send requests, view your friends' lists, manage incoming requests."}
          </DialogDescription>
        </DialogHeader>

        {!isDemoUser && (
          <Tabs defaultValue="friends" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger
                value="friends"
                className={FRIEND_TAB_TRIGGER_CLASS}
              >
                <Users className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className={FRIEND_TAB_TRIGGER_CLASS}
              >
                <Inbox className="h-4 w-4 mr-2" />
                Requests
                <NotificationBadge count={friends.incomingRequests.length} dot className="ml-2" />
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className={FRIEND_TAB_TRIGGER_CLASS}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Recs
                <NotificationBadge
                  count={recommendations.incoming.filter((r) => r.status === "pending").length}
                  dot
                  className="ml-2"
                />
              </TabsTrigger>
              <TabsTrigger
                value="find"
                className={FRIEND_TAB_TRIGGER_CLASS}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Find
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-4">
              <FriendsTab
                friends={friends}
                onViewFriend={(friend) => setViewingFriend(friend)}
              />
            </TabsContent>

            <TabsContent value="requests" className="mt-4">
              <RequestsTab friends={friends} />
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <RecommendationsTab recommendations={recommendations} />
            </TabsContent>

            <TabsContent value="find" className="mt-4">
              <FindTab friends={friends} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>

      {viewingFriend && (
        <FriendListView
          friend={viewingFriend}
          open={!!viewingFriend}
          onOpenChange={(value) => {
            if (!value) setViewingFriend(null);
          }}
        />
      )}
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Tab: Friends
// ---------------------------------------------------------------------------

function FriendsTab({
  friends,
  onViewFriend,
}: {
  friends: ReturnType<typeof useFriends>;
  onViewFriend: (friend: FriendSummary) => void;
}) {
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

// ---------------------------------------------------------------------------
// Tab: Requests
// ---------------------------------------------------------------------------

function RequestsTab({ friends }: { friends: ReturnType<typeof useFriends> }) {
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

// ---------------------------------------------------------------------------
// Tab: Find
// ---------------------------------------------------------------------------

function FindTab({ friends }: { friends: ReturnType<typeof useFriends> }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (query.trim().length < 2) return;
    setIsSearching(true);
    const { data, error } = await searchUsersByUsername(query);
    setIsSearching(false);
    if (error) return;
    setResults(data);
  };

  // Live auto-search: debounce 300ms after the user stops typing, then
  // run the same query. Stale-result guard via `cancelled` so an older
  // in-flight request can't overwrite newer results if the user keeps
  // typing. The manual Search button still works (same handler).
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      const { data, error } = await searchUsersByUsername(trimmed);
      if (cancelled) return;
      setIsSearching(false);
      if (error) return;
      setResults(data);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Helper — flag users who already have a relationship with us so the
  // Add button can be disabled instead of producing a 400.
  const existingIds = new Set<string>(
    [...friends.friends, ...friends.incomingRequests, ...friends.outgoingRequests].map(
      (f) => f.id,
    ),
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          className={FRIEND_INPUT_CLASS}
          placeholder="Search by username (at least 2 characters)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          }}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <Button
          type="button"
          onClick={handleSearch}
          disabled={query.trim().length < 2 || isSearching}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {results.length === 0 && !isSearching && (
        <p className={FRIEND_EMPTY_STATE_CLASS}>
          Search for someone's username to send a request.
        </p>
      )}

      <div className="space-y-2">
        {results.map((user) => {
          const alreadyRelated = existingIds.has(user.id);
          return (
            <div key={user.id} className={FRIEND_ROW_CLASS}>
              <div className="min-w-0 flex-1">
                <p className={FRIEND_ROW_NAME_CLASS}>{user.name || user.username}</p>
                <p className={FRIEND_ROW_USERNAME_CLASS}>@{user.username}</p>
              </div>
              <Button
                size="sm"
                onClick={() => friends.send(user.id)}
                disabled={alreadyRelated}
                title={alreadyRelated ? "Already connected" : "Send friend request"}
              >
                {alreadyRelated ? "Pending / friends" : "Add"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}
