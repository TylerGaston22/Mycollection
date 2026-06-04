/**
 * RecommendationsTab – content for the "Recs" tab in FriendsDialog.
 *   - Incoming pending: rows the recipient hasn't acted on yet. Each
 *     has an inline picker (status radio + optional sub-section select)
 *     so they can choose where the item lands; defaults are sensible
 *     so the common case is still ~one click.
 *   - Outgoing: things I've sent — small list with a Remove (delete) button.
 *
 * Hidden status='added'/'dismissed' from the incoming list once acted on.
 */

import { useState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import {
  FRIEND_EMPTY_STATE_CLASS,
  FRIEND_ROW_CLASS,
  FRIEND_ROW_NAME_CLASS,
  FRIEND_ROW_USERNAME_CLASS,
} from "../friends/styles";
import type { CustomSection } from "../types";
import type { ItemStatus } from "../constants";
import type { DecoratedRecommendation, useRecommendations } from "./useRecommendations";

interface RecommendationsTabProps {
  recommendations: ReturnType<typeof useRecommendations>;
  /** Recipient's own custom sections — used to populate the per-row section picker. */
  customSections: CustomSection[];
}

export function RecommendationsTab({ recommendations, customSections }: RecommendationsTabProps) {
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
              customSections={customSections}
              onAccept={(options) => recommendations.accept(rec, options)}
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

interface IncomingRowProps {
  rec: DecoratedRecommendation;
  customSections: CustomSection[];
  onAccept: (options: { status: ItemStatus; sections?: string[] }) => void;
  onDismiss: () => void;
}

function IncomingRow({ rec, customSections, onAccept, onDismiss }: IncomingRowProps) {
  // Each row owns its picker state. Defaults keep the "just accept it"
  // path fast: Want to See + no custom section.
  const [status, setStatus] = useState<ItemStatus>("want-to-see");
  const [sectionId, setSectionId] = useState<string>("");

  const senderLabel = rec.otherParty
    ? `${rec.otherParty.name} (${rec.otherParty.username})`
    : "Unknown sender";

  // Only show sub-sections that belong to the same content type as the
  // recommended item — others wouldn't be visible from that category anyway.
  const eligibleSections = customSections.filter(
    (s) => s.contentType === rec.item_snapshot.type,
  );

  const handleAccept = () => {
    onAccept({
      status,
      sections: sectionId ? [sectionId] : undefined,
    });
  };

  return (
    <div className={`${FRIEND_ROW_CLASS} flex-col items-stretch gap-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className={FRIEND_ROW_NAME_CLASS}>{rec.item_snapshot.title}</div>
          <div className={FRIEND_ROW_USERNAME_CLASS}>from {senderLabel}</div>
          {rec.note && (
            <div className="text-sm text-white/80 italic mt-1 line-clamp-2">"{rec.note}"</div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" size="sm" variant="outline" onClick={handleAccept} title="Add to my collection">
            <Check className="h-4 w-4" />
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onDismiss} title="Dismiss">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
        <RadioGroup
          value={status}
          onValueChange={(v) => setStatus(v as ItemStatus)}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="want-to-see" id={`rec-${rec.id}-want`} />
            <Label htmlFor={`rec-${rec.id}-want`} className="text-white/80 cursor-pointer">
              Want to See
            </Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="watched" id={`rec-${rec.id}-watched`} />
            <Label htmlFor={`rec-${rec.id}-watched`} className="text-white/80 cursor-pointer">
              Watched
            </Label>
          </div>
        </RadioGroup>

        {eligibleSections.length > 0 && (
          <label className="flex items-center gap-2">
            <span className="text-white/70">Section:</span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white text-sm"
            >
              <option value="">None</option>
              {eligibleSections.map((s) => (
                <option key={s.id} value={s.id} className="text-black">
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
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
