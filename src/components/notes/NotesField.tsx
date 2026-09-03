/**
 * NotesField – the notes textarea plus its attached screenshots.
 *
 * Paste a screenshot (Cmd/Ctrl+V) straight into the textarea, drop an
 * image file onto it, or use "Add image" to pick one — each route
 * uploads to the `note-images` bucket and appends the returned public
 * URL to the item's `noteImages`. The notes *text* stays plain text;
 * images live alongside it as a list, which is why no markdown parser
 * or HTML rendering is involved anywhere in this feature.
 *
 * Used by both places notes are edited — ItemFormDialog and
 * QuickEditDialog — so the paste behaviour can't drift between them.
 *
 * Upload happens on paste, not on save. Cancelling the dialog after
 * pasting therefore leaves an unreferenced object in the bucket; same
 * tradeoff avatars_storage.sql documents, and nothing links to it.
 *
 * Demo users see no upload affordances at all: they have no auth
 * identity, so the bucket's RLS would reject the write. This mirrors
 * how ProfileDialog hides avatar upload for them.
 */

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useSession } from "../../auth";
import { imageFilesFromDataTransfer, IMAGE_ALLOWED_MIME } from "../../utils/imageUpload";
import {
  NOTE_IMAGE_MAX_COUNT,
  uploadNoteImage,
  validateNoteImageFile,
} from "../../utils/uploadNoteImage";
import { sanitizeImageUrl } from "../../utils/sanitize";

interface NotesFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Currently attached screenshot URLs. */
  images: string[];
  onImagesChange: (images: string[]) => void;
  rows?: number;
  placeholder?: string;
  autoFocus?: boolean;
}

export function NotesField({
  id,
  value,
  onChange,
  images,
  onImagesChange,
  rows = 3,
  placeholder = "Add your thoughts...",
  autoFocus,
}: NotesFieldProps) {
  const { userId, canUploadImages } = useSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // How many uploads are in flight — drives the placeholder tiles so a
  // slow upload of a multi-MB screenshot doesn't look like nothing
  // happened. A count (not a boolean) because one paste can carry
  // several images.
  const [uploadsInFlight, setUploadsInFlight] = useState(0);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  // Latest-value ref for the attached list. Uploads are awaited, so the
  // `images` prop captured when a paste started is stale by the time it
  // finishes — appending to it would drop whatever a second, overlapping
  // paste added in the meantime. Reading the ref appends to the current
  // list instead.
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const safeImages = images.map(sanitizeImageUrl).filter((url): url is string => !!url);

  /**
   * Validate, upload, and append a batch of image files. Shared by the
   * paste, drop, and file-picker paths so all three behave identically
   * (same size cap, same count cap, same toasts).
   */
  const attachImageFiles = async (files: File[]) => {
    if (!canUploadImages || files.length === 0) return;

    const remainingSlots = NOTE_IMAGE_MAX_COUNT - imagesRef.current.length;
    if (remainingSlots <= 0) {
      toast.error(`A note can hold ${NOTE_IMAGE_MAX_COUNT} images.`);
      return;
    }
    let filesToAttach = files;
    if (filesToAttach.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} fit on this note.`);
      filesToAttach = filesToAttach.slice(0, remainingSlots);
    }

    const acceptedFiles: File[] = [];
    for (const file of filesToAttach) {
      const validationError = validateNoteImageFile(file);
      if (validationError) toast.error(validationError);
      else acceptedFiles.push(file);
    }
    if (acceptedFiles.length === 0) return;

    setUploadsInFlight((count) => count + acceptedFiles.length);
    // Upload in parallel, but settle rather than race: one failed file
    // shouldn't discard the ones that succeeded alongside it.
    const results = await Promise.allSettled(
      acceptedFiles.map((file) => uploadNoteImage(userId, file)),
    );
    setUploadsInFlight((count) => count - acceptedFiles.length);

    const uploadedUrls: string[] = [];
    let failureMessage: string | null = null;
    for (const result of results) {
      if (result.status === "fulfilled") {
        uploadedUrls.push(result.value);
      } else if (!failureMessage) {
        failureMessage =
          result.reason instanceof Error ? result.reason.message : "Upload failed";
      }
    }

    if (uploadedUrls.length > 0) onImagesChange([...imagesRef.current, ...uploadedUrls]);
    if (failureMessage) {
      toast.error("Couldn't attach screenshot", { description: failureMessage });
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageFiles = imageFilesFromDataTransfer(event.clipboardData);
    if (imageFiles.length === 0) return; // Plain text paste — let it through.
    if (!canUploadImages) return;
    // Stop the browser inserting the clipboard's text alternative (a
    // filename, or the HTML the screenshot was copied from) into the note.
    event.preventDefault();
    attachImageFiles(imageFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLTextAreaElement>) => {
    setIsDraggedOver(false);
    const imageFiles = imageFilesFromDataTransfer(event.dataTransfer);
    if (imageFiles.length === 0 || !canUploadImages) return;
    event.preventDefault();
    attachImageFiles(imageFiles);
  };

  const handleFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    // Clear the input so picking the same file again still fires onChange.
    event.target.value = "";
    attachImageFiles(picked);
  };

  /** Detaches an image from this note. The bucket object is left in
   *  place — the removal isn't committed until the dialog is saved, so
   *  deleting here would destroy the file even if the user cancels. */
  const removeImage = (urlToRemove: string) => {
    onImagesChange(imagesRef.current.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="grid gap-2">
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(event) => {
          if (!canUploadImages) return;
          event.preventDefault();
          setIsDraggedOver(true);
        }}
        onDragLeave={() => setIsDraggedOver(false)}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className={isDraggedOver ? "border-ring ring-ring/50 ring-[3px]" : undefined}
      />

      {canUploadImages && (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Paste a screenshot, or drop an image here.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_ALLOWED_MIME.join(",")}
              multiple
              className="hidden"
              onChange={handleFilePicked}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= NOTE_IMAGE_MAX_COUNT}
            >
              <ImagePlus className="h-4 w-4" />
              Add image
            </Button>
          </div>

          {(safeImages.length > 0 || uploadsInFlight > 0) && (
            <div className="flex flex-wrap gap-2">
              {safeImages.map((url) => (
                <div key={url} className="group relative h-20 w-20">
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full rounded-md border bg-muted object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Remove image"
                    className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-white opacity-90 transition-opacity hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {/* One placeholder tile per in-flight upload. */}
              {Array.from({ length: uploadsInFlight }).map((_, index) => (
                <div
                  key={`uploading-${index}`}
                  className="flex h-20 w-20 items-center justify-center rounded-md border bg-muted"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
