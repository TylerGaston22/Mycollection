/**
 * uploadAvatar – pure helper that uploads an avatar image to the
 * Supabase `avatars` bucket and returns the public URL. No React, no
 * toasts — callers (e.g. ProfileDialog) decide how to surface the
 * outcome to the user.
 *
 * File layout in the bucket: `<userId>/<timestamp>.<ext>` — the first
 * path segment is the owner id, which is what the storage RLS
 * policies enforce.
 */

import { supabase } from "../lib/supabase";

export interface UploadAvatarResult {
  /** Public URL of the new avatar, ready to drop into <img src>. */
  publicUrl: string;
}

/** Inputs the UI should validate before calling — kept in one place. */
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const AVATAR_ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/**
 * Validate a user-picked File. Returns a string error message when
 * invalid, or null when fine. Pure — no toasts.
 */
export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ALLOWED_MIME.includes(file.type)) {
    return 'Please pick a PNG, JPG, GIF, or WebP image.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return `Image is too big (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 2 MB.`;
  }
  return null;
}

/**
 * Upload a validated avatar file. Returns { publicUrl } on success,
 * throws on Supabase error so the caller can show a toast / surface
 * the message verbatim.
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadAvatarResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  // Timestamp suffix so subsequent uploads don't collide with the
  // previous file in the same user folder. Old files become stale —
  // see avatars_storage.sql comment for the cleanup tradeoff.
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}
