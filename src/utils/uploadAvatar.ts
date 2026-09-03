/**
 * uploadAvatar – uploads a profile picture to the Supabase `avatars`
 * bucket and returns the public URL. No React, no toasts — callers
 * (e.g. ProfileDialog) decide how to surface the outcome to the user.
 *
 * A thin wrapper over utils/imageUpload.ts, which owns the shared
 * validation + upload mechanics; this file only pins the bucket name
 * and the avatar-specific size cap.
 *
 * File layout in the bucket: `<userId>/<timestamp>-<random>.<ext>` —
 * the first path segment is the owner id, which is what the storage RLS
 * policies enforce.
 */

import {
  IMAGE_ALLOWED_MIME,
  makeImageFileValidator,
  uploadImageToBucket,
} from './imageUpload';

const AVATARS_BUCKET = 'avatars';

export interface UploadAvatarResult {
  /** Public URL of the new avatar, ready to drop into <img src>. */
  publicUrl: string;
}

/** Inputs the UI should validate before calling — kept in one place. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const AVATAR_ALLOWED_MIME = IMAGE_ALLOWED_MIME;

/**
 * Validate a user-picked File. Returns a string error message when
 * invalid, or null when fine. Pure — no toasts.
 */
export const validateAvatarFile = makeImageFileValidator(AVATAR_MAX_BYTES);

/**
 * Upload a validated avatar file. Returns { publicUrl } on success,
 * throws on Supabase error so the caller can show a toast / surface
 * the message verbatim.
 *
 * Uploading a new avatar orphans the previous one — see
 * avatars_storage.sql for the cleanup tradeoff.
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadAvatarResult> {
  const publicUrl = await uploadImageToBucket(AVATARS_BUCKET, userId, file);
  return { publicUrl };
}
