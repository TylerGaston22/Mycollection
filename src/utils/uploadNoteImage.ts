/**
 * uploadNoteImage – uploads a screenshot pasted into an item's notes to
 * the Supabase `note-images` bucket and returns the public URL.
 *
 * Same shape as uploadAvatar.ts (both are thin wrappers over
 * utils/imageUpload.ts); the differences are the bucket and a larger
 * size cap, since a full-screen screenshot is routinely bigger than a
 * profile picture.
 *
 * File layout: `<userId>/<timestamp>-<random>.<ext>` — the first path
 * segment is the owner id, which is what the storage RLS policies in
 * supabase/note_images.sql enforce.
 */

import { makeImageFileValidator, uploadImageToBucket } from './imageUpload';

const NOTE_IMAGES_BUCKET = 'note-images';

/**
 * 5 MB. A retina full-screen PNG screenshot lands around 3–5 MB, so a
 * 2 MB cap (what avatars use) would reject the common case.
 */
export const NOTE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Cap on how many screenshots one note can hold. Keeps a runaway paste
 * from turning a single row into a hundred storage objects, and keeps
 * the thumbnail strip a sane size.
 */
export const NOTE_IMAGE_MAX_COUNT = 12;

/** Returns an error message for an unacceptable file, or null. Pure. */
export const validateNoteImageFile = makeImageFileValidator(NOTE_IMAGE_MAX_BYTES);

/** Upload one validated screenshot. Throws on Supabase error. */
export function uploadNoteImage(userId: string, file: File): Promise<string> {
  return uploadImageToBucket(NOTE_IMAGES_BUCKET, userId, file);
}
