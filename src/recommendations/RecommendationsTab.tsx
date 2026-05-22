/**
 * RecommendationsTab – content for the "Recommendations" tab in
 * FriendsDialog. Two sections:
 *   - Incoming pending: rows the recipient hasn't acted on yet.
 *     Accept (adds to collection + flips status='added') / Dismiss.
 *   - Outgoing: things I've sent — small list with a Remove (delete) button.
 * Hidden status='added'/'dismissed' from the incoming list once acted on.
 */

import { Check, X, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  FRIEND_EMPTY_STATE_CLASS,
  FRIEND_ROW_CLASS,
  FRIEND_ROW_NAME_CLASS,
  FRIEND_ROW_USERNAME_CLASS,
} from "../friends/styles";
import type { DecoratedRecommendation, useRecommendations } from "./useRecommendations";

interface RecommendationsTabProps {
  recommendations: ReturnType<typeof useRecommendations>;
}

export function RecommendationsTab({ recommendations }: RecommendationsTabProps) {
  const pendingIncoming = recommendations.incoming.filter((r) => r.status === "pending");
  const hasOutgoing = recommendations.outgoing.length > 0;

  if (pendingIncoming.length === 0 && !hasOutgoing) {
    return (
      <div className={FRIEND_EMPTY_STATE_CLASS}>
        No recommendations yet. Friends can send you items from any item's detail dialog.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingIncoming.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-sm font-medium text-white">
            Incoming ({pendingIncoming.length})
          </h4>
          {pendingIncoming.map((rec) => (
            <IncomingRow
              key={rec.id}
              rec={rec}
              onAccept={() => recommendations.accept(rec)}
              onDismiss={() => recommendations.dismiss(rec.id)}
            />
          ))}
        </section>
      )}

      {hasOutgoing && (
        <section className="space-y-2">
          <h4 className="text-sm font-medium text-white">
            Pending sent ({recommendations.outgoing.length})
          </h4>
          {recommendations.outgoing.map((rec) => (
            <OutgoingRow
              key={rec.id}
              rec={rec}
              onRemove={() => recommendations.remove(rec.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function IncomingRow({
  rec,
  onAccept,
  onDismiss,
}: {
  rec: DecoratedRecommendation;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const senderLabel = rec.otherParty
    ? `${rec.otherParty.name} (${rec.otherParty.username})`
    : "Unknown sender";
  return (
    <div className={FRIEND_ROW_CLASS}>
      <div className="min-w-0 flex-1">
        <div className={FRIEND_ROW_NAME_CLASS}>{rec.item_snapshot.title}</div>
        <div className={FRIEND_ROW_USERNAME_CLASS}>from {senderLabel}</div>
        {rec.note && (
          <div className="text-sm text-white/80 italic mt-1 line-clamp-2">"{rec.note}"</div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button type="button" size="sm" variant="outline" onClick={onAccept} title="Add to my collection">
          <Check className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDismiss} title="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function OutgoingRow({
  rec,
  onRemove,
}: {
  rec: DecoratedRecommendation;
  onRemove: () => void;
}) {
  const recipientLabel = rec.otherParty
    ? `${rec.otherParty.name} (${rec.otherParty.username})`
    : "Unknown recipient";
  return (
    <div className={FRIEND_ROW_CLASS}>
      <div className="min-w-0 flex-1">
        <div className={FRIEND_ROW_NAME_CLASS}>{rec.item_snapshot.title}</div>
        <div className={FRIEND_ROW_USERNAME_CLASS}>
          to {recipientLabel} · {rec.status}
        </div>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onRemove} title="Delete recommendation">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
