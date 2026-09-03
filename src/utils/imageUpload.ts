/**
 * imageUpload – the shared primitives behind every image upload in the
 * app (profile avatars, note screenshots).
 *
 * Both callers need the same three things: an allowed-MIME list, a
 * size-limit validator that produces a user-readable message, and an
 * "upload to a per-user folder in a public bucket" call. They differ
 * only in the bucket name and the size cap, so those are parameters —
 * see uploadAvatar.ts and uploadNoteImage.ts for the two thin wrappers.
 *
 * Everything here except `uploadImageToBucket` is pure — no React, no
 * toasts, no DOM — so the validation and clipboard rules are unit
 * testable without network or browser mocks.
 */

import { supabase } from '../lib/supabase';

/**
 * Raster formats we accept everywhere. SVG is deliberately excluded —
 * it can carry script, and the buckets are public-read.
 */
export const IMAGE_ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/** Human-readable list used in the rejection message. */
const IMAGE_FORMAT_LIST = 'PNG, JPG, GIF, or WebP';

/** Formats a byte count as "1.4 MB" — used for the rejected file's size. */
export function formatMegabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Formats a size *limit*. Caps are round numbers, so "Max 2 MB" reads
 * better than "Max 2.0 MB"; a non-whole cap still falls back to one
 * decimal rather than rounding away the difference.
 */
function formatLimit(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return Number.isInteger(mb) ? `${mb} MB` : formatMegabytes(bytes);
}

/**
 * Builds a validator for a given size cap. Returns a function that
 * takes a File and gives back a string error message when it's
 * unacceptable, or null when it's fine.
 *
 * The MIME check runs before the size check so a .txt rename gets a
 * format error rather than a confusing size one.
 */
export function makeImageFileValidator(maxBytes: number) {
  return function validateImageFile(file: File): string | null {
    if (!IMAGE_ALLOWED_MIME.includes(file.type)) {
      return `Please pick a ${IMAGE_FORMAT_LIST} image.`;
    }
    if (file.size > maxBytes) {
      return `Image is too big (${formatMegabytes(file.size)}). Max ${formatLimit(maxBytes)}.`;
    }
    return null;
  };
}

/**
 * Pulls every image file out of a clipboard paste or a drag-and-drop.
 *
 * A screenshot pasted from the OS clipboard arrives as a DataTransfer
 * item of kind 'file' with no filename (Chrome calls it "image.png",
 * Safari gives an empty name) — `getAsFile()` is the only way to reach
 * the bytes. Non-image items (the text that came along with a copied
 * region, for instance) are skipped rather than rejected, so pasting
 * rich content into the notes box still inserts its text normally.
 *
 * Pure apart from reading the DataTransfer, so it can be tested with a
 * hand-rolled stub.
 */
export function imageFilesFromDataTransfer(dataTransfer: DataTransfer | null): File[] {
  if (!dataTransfer) return [];
  const files: File[] = [];
  for (const item of Array.from(dataTransfer.items || [])) {
    if (item.kind !== 'file') continue;
    const file = item.getAsFile();
    if (file && IMAGE_ALLOWED_MIME.includes(file.type)) files.push(file);
  }
  return files;
}

/** Maps a MIME type to the extension we store the object under. */
function extensionForMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg';
  return mime.split('/')[1] || 'png';
}

/**
 * Upload a validated image into `<userId>/` inside a public bucket and
 * return its public URL. Throws on a Supabase error so the caller can
 * surface the message verbatim in a toast.
 *
 * The object name is timestamp + random suffix: a paste of several
 * screenshots fires these calls in the same millisecond, so the
 * timestamp alone would collide.
 */
export async function uploadImageToBucket(
  bucket: string,
  userId: string,
  file: File,
): Promise<string> {
  const ext = extensionForMime(file.type);
  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  const path = `${userId}/${Date.now()}-${uniqueSuffix}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
