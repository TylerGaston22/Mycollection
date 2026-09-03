/**
 * NoteImageGallery – read-only thumbnail strip for the screenshots
 * attached to an item's notes, with a click-to-enlarge lightbox.
 *
 * Used wherever notes are *shown* rather than edited (ItemDetailDialog,
 * and the read-only friend view). The editable counterpart is
 * NotesField, which renders the same thumbnails plus remove controls.
 *
 * Every URL goes through sanitizeImageUrl before it reaches an <img>,
 * even though the write path already validated it — the read path also
 * serves imported JSON and other users' rows, so it re-checks rather
 * than trusting what's in the database.
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { sanitizeImageUrl } from "../../utils/sanitize";

interface NoteImageGalleryProps {
  images: string[] | undefined;
  /** Shown as the lightbox's accessible title. */
  itemTitle: string;
}

export function NoteImageGallery({ images, itemTitle }: NoteImageGalleryProps) {
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

  const safeImages = (images ?? [])
    .map(sanitizeImageUrl)
    .filter((url): url is string => !!url);

  if (safeImages.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {safeImages.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => setEnlargedImageUrl(url)}
            className="h-20 w-20 overflow-hidden rounded-md border bg-muted transition-opacity hover:opacity-80"
          >
            <img
              src={url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox. Sized to the viewport rather than the usual dialog
          width so a wide screenshot is actually readable. */}
      <Dialog
        open={!!enlargedImageUrl}
        onOpenChange={(isOpen) => { if (!isOpen) setEnlargedImageUrl(null); }}
      >
        <DialogContent className="sm:max-w-[90vw] p-2">
          <DialogTitle className="sr-only">Screenshot from {itemTitle}</DialogTitle>
          {enlargedImageUrl && (
            <img
              src={enlargedImageUrl}
              alt=""
              className="max-h-[85vh] w-full rounded object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
