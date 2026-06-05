/**
 * FindTab – search users by username + send friend request.
 * Owns its own query/results/searching state and a 300ms-debounced
 * auto-search so results appear as the user types. The manual Search
 * button is still wired and fires the same handler.
 */

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  FRIEND_EMPTY_STATE_CLASS,
  FRIEND_INPUT_CLASS,
  FRIEND_ROW_CLASS,
  FRIEND_ROW_NAME_CLASS,
  FRIEND_ROW_USERNAME_CLASS,
} from "./styles";
import { searchUsersByUsername, type UserMatch } from "./client";
import type { useFriends } from "./useFriends";

interface FindTabProps {
  friends: ReturnType<typeof useFriends>;
}

export function FindTab({ friends }: FindTabProps) {
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

  // Flag users who already have a relationship with us so the Add
  // button can be disabled instead of producing a 400 from the unique-
  // pair constraint.
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
