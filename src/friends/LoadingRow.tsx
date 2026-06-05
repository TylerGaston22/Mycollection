/**
 * LoadingRow – centered spinner placeholder used by the FriendsDialog
 * tabs while the underlying useFriends hook is loading its first batch.
 */

import { Loader2 } from "lucide-react";

export function LoadingRow() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}
