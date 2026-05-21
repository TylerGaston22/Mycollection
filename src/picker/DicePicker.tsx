/**
 * DicePicker – a dice-icon button that, when clicked, picks a random
 * item from the supplied pool and shows it in a modal. Lives in its
 * own folder (src/picker/) so it can be moved, removed, or replaced
 * without touching the rest of the app.
 *
 * Props:
 *   items         — the pool to pick from (caller filters before passing)
 *   contentType   — used for the modal heading copy ("Restaurant suggestion" etc.)
 *   currentTheme  — for accent-coloured styling
 *   onOpenItem    — called when the user clicks "Open" on the suggestion;
 *                   typically wired to the existing item-detail dialog
 */

import { useState } from "react";
import { Dices } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { ThemePrimaryButton } from "../components/ui/ThemePrimaryButton";
import { Item } from "../types";
import { ThemeConfig } from "../utils/themeConfig";
import { getContentTypeFieldConfig } from "../utils/contentHelpers";
import { sanitizeImageUrl } from "../utils/sanitize";
import { pickRandom } from "./pickRandom";

interface DicePickerProps {
  items: Item[];
  contentType: string;
  currentTheme: ThemeConfig;
  onOpenItem: (item: Item) => void;
}

export function DicePicker({ items, contentType, currentTheme, onOpenItem }: DicePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickedItem, setPickedItem] = useState<Item | null>(null);

  const fieldConfig = getContentTypeFieldConfig(contentType);
  const eligibleCount = items.length;
  const hasSomethingToPick = eligibleCount > 0;
  const canReRoll = eligibleCount > 1;

  const handleRoll = (excludeId?: string) => {
    setPickedItem(pickRandom(items, excludeId));
  };

  const handleOpenPicker = () => {
    if (!hasSomethingToPick) return;
    handleRoll();
    setIsOpen(true);
  };

  const handleOpenItem = () => {
    if (!pickedItem) return;
    onOpenItem(pickedItem);
    setIsOpen(false);
  };

  const poster = pickedItem ? sanitizeImageUrl(pickedItem.posterUrl) : undefined;

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenPicker}
        variant="outline"
        size="icon"
        disabled={!hasSomethingToPick}
        aria-label={`Pick a random ${fieldConfig.displayLabel.toLowerCase()}`}
        title={
          hasSomethingToPick
            ? `Pick a random ${fieldConfig.displayLabel.toLowerCase()} for me`
            : `Add some ${fieldConfig.displayLabel.toLowerCase()}s first`
        }
        // Real-dice colors: white face, black pips. Theme-independent so the
        // icon reads as a die in both light and dark mode.
        style={{
          backgroundColor: "white",
          borderColor: "rgba(0, 0, 0, 0.2)",
          color: "black",
        }}
        onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.currentTarget.style.backgroundColor = "#f0f0f0";
        }}
        onMouseLeave={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.currentTarget.style.backgroundColor = "white";
        }}
      >
        <Dices className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>How about this {fieldConfig.displayLabel.toLowerCase()}?</DialogTitle>
            <DialogDescription>
              {canReRoll
                ? `Picked at random from ${eligibleCount} options. Hit re-roll if you want another.`
                : "Only one option to choose from."}
            </DialogDescription>
          </DialogHeader>

          {pickedItem && (
            <div className="flex gap-4 py-4">
              {poster ? (
                <img
                  src={poster}
                  alt=""
                  className="w-24 h-32 object-cover rounded-md flex-shrink-0 bg-muted"
                />
              ) : (
                <div className="w-24 h-32 rounded-md flex-shrink-0 bg-muted" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-lg truncate">{pickedItem.title}</p>
                {pickedItem.year && (
                  <p className="text-sm text-muted-foreground">{pickedItem.year}</p>
                )}
                {pickedItem.platform && (
                  <p className="text-sm text-muted-foreground mt-1">{pickedItem.platform}</p>
                )}
                {pickedItem.genre && (
                  <p className="text-sm text-muted-foreground mt-1">{pickedItem.genre}</p>
                )}
                {pickedItem.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                    {pickedItem.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleRoll(pickedItem?.id)}
              disabled={!canReRoll}
            >
              <Dices className="h-4 w-4 mr-2" />
              Re-roll
            </Button>
            <ThemePrimaryButton
              type="button"
              onClick={handleOpenItem}
              currentTheme={currentTheme}
            >
              Open
            </ThemePrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
