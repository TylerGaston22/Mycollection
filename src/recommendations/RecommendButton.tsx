/**
 * RecommendButton – opens the RecommendDialog for a single item.
 *
 * Hidden when the user has zero friends (recommending requires an
 * accepted friendship). Kept as its own component so any place that
 * shows item actions (detail dialog, future quick-actions menu) can
 * drop it in without duplicating the open-state plumbing.
 */

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { RecommendDialog } from "./RecommendDialog";
import type { Item } from "../types";
import type { FriendSummary } from "../friends/client";
import type { useRecommendations } from "./useRecommendations";

interface RecommendButtonProps {
  item: Item;
  friends: FriendSummary[];
  recommendations: ReturnType<typeof useRecommendations>;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default";
  isDemoUser?: boolean;
}

export function RecommendButton({
  item,
  friends,
  recommendations,
  variant = "outline",
  size = "sm",
  isDemoUser,
}: RecommendButtonProps) {
  const [open, setOpen] = useState(false);

  // Demo users have no Supabase identity, so recommendations are inert.
  if (isDemoUser) return null;
  if (friends.length === 0) return null;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        title="Recommend to a friend"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Recommend
      </Button>
      <RecommendDialog
        open={open}
        onOpenChange={setOpen}
        item={item}
        friends={friends}
        recommendations={recommendations}
      />
    </>
  );
}
