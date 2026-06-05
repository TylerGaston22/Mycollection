/**
 * FriendsDialog – four-tab dialog (Friends / Requests / Recs / Find)
 * over the useFriends + useRecommendations hooks. The tabs themselves
 * live in sibling files; this component is just the shell + tab
 * orchestration + the nested FriendListView modal.
 */

import { useState } from "react";
import { Users, UserPlus, Inbox, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { NotificationBadge } from "../components/ui/NotificationBadge";
import { SURFACE_BACKGROUND } from "../utils/surfaceBackgrounds";
import { RecommendationsTab } from "../recommendations/RecommendationsTab";
import type { useRecommendations } from "../recommendations/useRecommendations";
import type { CustomSection } from "../types";
import type { FriendSummary } from "./client";
import type { useFriends } from "./useFriends";
import { FriendListView } from "./FriendListView";
import { FriendsTab } from "./FriendsTab";
import { RequestsTab } from "./RequestsTab";
import { FindTab } from "./FindTab";
import { FRIEND_TAB_TRIGGER_CLASS } from "./styles";

interface FriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friends: ReturnType<typeof useFriends>;
  recommendations: ReturnType<typeof useRecommendations>;
  /** Recipient's custom sections — used by the per-row picker on incoming recs. */
  customSections: CustomSection[];
  /** Demo users can open the dialog but every action is gated to a friendly message. */
  isDemoUser: boolean;
}

export function FriendsDialog({
  open,
  onOpenChange,
  friends,
  recommendations,
  customSections,
  isDemoUser,
}: FriendsDialogProps) {
  const [viewingFriend, setViewingFriend] = useState<FriendSummary | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto text-white border-white/10 [&_[data-slot=dialog-description]]:text-white/70"
        style={{ background: SURFACE_BACKGROUND }}
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
              <TabsTrigger value="friends" className={FRIEND_TAB_TRIGGER_CLASS}>
                <Users className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="requests" className={FRIEND_TAB_TRIGGER_CLASS}>
                <Inbox className="h-4 w-4 mr-2" />
                Requests
                <NotificationBadge count={friends.incomingRequests.length} dot className="ml-2" />
              </TabsTrigger>
              <TabsTrigger value="recommendations" className={FRIEND_TAB_TRIGGER_CLASS}>
                <Share2 className="h-4 w-4 mr-2" />
                Recs
                <NotificationBadge
                  count={recommendations.incoming.filter((r) => r.status === "pending").length}
                  dot
                  className="ml-2"
                />
              </TabsTrigger>
              <TabsTrigger value="find" className={FRIEND_TAB_TRIGGER_CLASS}>
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
              <RecommendationsTab
                recommendations={recommendations}
                customSections={customSections}
              />
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
