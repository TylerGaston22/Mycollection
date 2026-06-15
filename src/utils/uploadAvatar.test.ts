/**
 * Tests for the pure `validateAvatarFile` validator in uploadAvatar.ts.
 *
 * The actual `uploadAvatar` upload path goes through the Supabase client
 * and isn't unit-testable without network mocks — we leave that for an
 * integration test session (when we wire up a test Supabase project).
 * The validator is the part that needs to be bullet-proof anyway —
 * everything else is just a passthrough to Supabase's storage SDK.
 */

import { describe, expect, it } from 'vitest';
import {
  validateAvatarFile,
  AVATAR_ALLOWED_MIME,
  AVATAR_MAX_BYTES,
} from './uploadAvatar';

/** Build a fake File for tests — content doesn't matter, we only read
 *  the metadata (type + size). The size is derived from the byte array
 *  the File constructor receives. */
function buildFile(name: string, mime: string, size: number): File {
  // Allocate `size` bytes of zeros so File reports the right size.
  const bytes = new Uint8Array(size);
  return new File([bytes], name, { type: mime });
}

describe('validateAvatarFile', () => {
  it.each(AVATAR_ALLOWED_MIME)('accepts the standard image mime types (%s)', (mime) => {
    const file = buildFile('avatar.png', mime, 1024);
    expect(validateAvatarFile(file)).toBeNull();
  });

  it('rejects non-image mime types', () => {
    const file = buildFile('notes.txt', 'text/plain', 1024);
    expect(validateAvatarFile(file)).toMatch(/PNG, JPG, GIF, or WebP/);
  });

  it('rejects unsupported image mime types (e.g. svg)', () => {
    const file = buildFile('avatar.svg', 'image/svg+xml', 1024);
    expect(validateAvatarFile(file)).toMatch(/PNG, JPG, GIF, or WebP/);
  });

  it('accepts a file exactly at the max size limit', () => {
    const file = buildFile('big.png', 'image/png', AVATAR_MAX_BYTES);
    expect(validateAvatarFile(file)).toBeNull();
  });

  it('rejects a file one byte over the limit', () => {
    const file = buildFile('toobig.png', 'image/png', AVATAR_MAX_BYTES + 1);
    expect(validateAvatarFile(file)).toMatch(/Max 2 MB/);
  });

  it('reports the actual size in MB in the error', () => {
    // 3 MB file should mention "3.0 MB" in the rejection message.
    const file = buildFile('huge.png', 'image/png', 3 * 1024 * 1024);
    expect(validateAvatarFile(file)).toMatch(/3\.0 MB/);
  });

  it('mime-type check fires BEFORE size — wrong type with a tiny file still errors', () => {
    const file = buildFile('tiny.txt', 'text/plain', 10);
    // The returned message should be about format, not size.
    expect(validateAvatarFile(file)).not.toMatch(/Max 2 MB/);
    expect(validateAvatarFile(file)).toMatch(/PNG/);
  });
});
