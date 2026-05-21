/**
 * FriendListView – read-only modal showing one friend's collection_items.
 * Loaded on demand when the user clicks "View list" on a friend row in
 * FriendsDialog. RLS controls visibility — if the friend hasn't set their
 * list to "friends", the query returns empty and we show the relevant
 * empty state.
 */

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Item } from "../types";
import { sanitizeImageUrl } from "../utils/sanitize";
import { handleSupabaseError } from "../utils/toastError";
import { fetchFriendItems, type FriendSummary } from "./client";
import { FRIEND_EMPTY_STATE_CLASS } from "./styles";

interface FriendListViewProps {
  friend: FriendSummary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Translate a DB row to the app's Item shape. Mirrors the converter in
// useItems.ts; kept local here so the friends folder doesn't reach into
// the items hook's internals.
function rowToItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as string,
    year: (row.year as string) || undefined,
    posterUrl: (row.poster_url as string) || undefined,
    status: row.status as Item["status"],
    rating: (row.rating as number) || undefined,
    favorite: row.favorite as boolean,
    notes: (row.notes as string) || undefined,
    platform: (row.platform as string) || undefined,
    studio: (row.studio as string) || undefined,
    genre: (row.genre as string) || undefined,
    seasons: (row.seasons as number) || undefined,
    episodes: (row.episodes as number) || undefined,
    sections: (row.sections as string[]) || undefined,
  };
}

export function FriendListView({ friend, open, onOpenChange }: FriendListViewProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      const { data, error } = await fetchFriendItems(friend.id);
      if (cancelled) return;
      setIsLoading(false);
      if (handleSupabaseError("Failed to load friend's list", error)) return;
      setItems((data ?? []).map(rowToItem));
    })();
    return () => {
      cancelled = true;
    };
  }, [open, friend.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{friend.name || friend.username}'s collection</DialogTitle>
          <DialogDescription>
            Read-only view of @{friend.username}'s items.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className={FRIEND_EMPTY_STATE_CLASS}>
            Nothing to show. Either their collection is empty, or they haven't enabled friend visibility for it.
          </p>
        ) : (
          <ul className="space-y-2 mt-2">
            {items.map((item) => {
              const poster = sanitizeImageUrl(item.posterUrl);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md border border-border bg-card"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt=""
                      className="w-10 h-14 object-cover rounded flex-shrink-0 bg-muted"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded flex-shrink-0 bg-muted" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.year, item.platform, item.genre].filter(Boolean).join(" · ") || item.type}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize flex-shrink-0">
                    {item.status === "watched" ? "watched" : "want to see"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
