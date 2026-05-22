/**
 * RecommendDialog – pick a friend + write a note + send.
 *
 * Opened from <RecommendButton> on any item. Friend list comes from
 * useFriends().friends (accepted only — you can't recommend to a
 * pending request). Empty state when no friends yet.
 */

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  FRIEND_EMPTY_STATE_CLASS,
  FRIEND_INPUT_CLASS,
  FRIEND_ROW_CLASS,
  FRIEND_ROW_NAME_CLASS,
  FRIEND_ROW_USERNAME_CLASS,
} from "../friends/styles";
import { NAVY_SURFACE_BACKGROUND } from "../utils/surfaceBackgrounds";
import type { Item } from "../types";
import type { FriendSummary } from "../friends/client";
import type { useRecommendations } from "./useRecommendations";

interface RecommendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  friends: FriendSummary[];
  recommendations: ReturnType<typeof useRecommendations>;
}

export function RecommendDialog({
  open,
  onOpenChange,
  item,
  friends,
  recommendations,
}: RecommendDialogProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Reset internal state when the dialog (or the recommended item) changes.
  useEffect(() => {
    if (!open) {
      setSelectedFriendId(null);
      setNote("");
      setIsSending(false);
    }
  }, [open, item?.id]);

  const handleSend = async () => {
    if (!item || !selectedFriendId) return;
    setIsSending(true);
    const ok = await recommendations.send({
      toUserId: selectedFriendId,
      item,
      note: note.trim() || undefined,
    });
    setIsSending(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto text-white border-white/10 [&_[data-slot=dialog-description]]:text-white/70"
        style={{ background: NAVY_SURFACE_BACKGROUND }}
      >
        <DialogHeader>
          <DialogTitle>Recommend to a friend</DialogTitle>
          <DialogDescription>
            {item ? `Send "${item.title}" with an optional note.` : "Pick a friend."}
          </DialogDescription>
        </DialogHeader>

        {friends.length === 0 && (
          <div className={FRIEND_EMPTY_STATE_CLASS}>
            You don't have any friends yet. Add one from the Friends dialog first.
          </div>
        )}

        {friends.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
              {friends.map((friend) => {
                const isSelected = friend.id === selectedFriendId;
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => setSelectedFriendId(friend.id)}
                    className={`${FRIEND_ROW_CLASS} w-full text-left rounded-md transition-colors ${
                      isSelected ? "bg-white/15" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className={FRIEND_ROW_NAME_CLASS}>{friend.name}</div>
                      <div className={FRIEND_ROW_USERNAME_CLASS}>{friend.username}</div>
                    </div>
                    {isSelected && <span className="text-xs text-white/70">Selected</span>}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70" htmlFor="rec-note">
                Note (optional)
              </label>
              <Textarea
                id="rec-note"
                className={FRIEND_INPUT_CLASS}
                placeholder="Why should they see this?"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSend}
                disabled={!selectedFriendId || isSending || !item}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
