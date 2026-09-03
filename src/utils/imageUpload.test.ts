/**
 * Tests for the pure parts of imageUpload.ts — the size/format
 * validator factory and the clipboard/drop extractor.
 *
 * `uploadImageToBucket` goes through the Supabase client and isn't
 * unit-testable without network mocks (same reasoning as
 * uploadAvatar.test.ts). These two are the parts that decide what a
 * user is allowed to attach, so they're the ones worth pinning down.
 */

import { describe, expect, it } from 'vitest';
import {
  IMAGE_ALLOWED_MIME,
  formatMegabytes,
  imageFilesFromDataTransfer,
  makeImageFileValidator,
} from './imageUpload';

function buildFile(name: string, mime: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type: mime });
}

/** Minimal stand-in for the DataTransfer a paste/drop event carries. */
function buildDataTransfer(
  entries: Array<{ kind: string; file: File | null }>,
): DataTransfer {
  return {
    items: entries.map((entry) => ({
      kind: entry.kind,
      getAsFile: () => entry.file,
    })),
  } as unknown as DataTransfer;
}

describe('makeImageFileValidator', () => {
  const validate = makeImageFileValidator(5 * 1024 * 1024);

  it.each(IMAGE_ALLOWED_MIME)('accepts %s', (mime) => {
    expect(validate(buildFile('shot.png', mime))).toBeNull();
  });

  it('rejects non-image types', () => {
    expect(validate(buildFile('notes.txt', 'text/plain'))).toMatch(/PNG, JPG, GIF, or WebP/);
  });

  it('rejects svg — it can carry script and the bucket is public-read', () => {
    expect(validate(buildFile('x.svg', 'image/svg+xml'))).toMatch(/PNG, JPG, GIF, or WebP/);
  });

  it('accepts a file exactly at the cap', () => {
    expect(validate(buildFile('big.png', 'image/png', 5 * 1024 * 1024))).toBeNull();
  });

  it('rejects one byte over the cap, naming both sizes', () => {
    const message = validate(buildFile('big.png', 'image/png', 5 * 1024 * 1024 + 1));
    expect(message).toMatch(/Max 5 MB/);
    expect(message).toMatch(/5\.0 MB/);
  });

  it('checks format before size', () => {
    const message = validate(buildFile('huge.txt', 'text/plain', 50 * 1024 * 1024));
    expect(message).toMatch(/PNG/);
    expect(message).not.toMatch(/too big/);
  });

  it('each validator keeps its own cap', () => {
    const strict = makeImageFileValidator(1024);
    const file = buildFile('shot.png', 'image/png', 2048);
    expect(strict(file)).toMatch(/too big/);
    expect(validate(file)).toBeNull();
  });
});

describe('formatMegabytes', () => {
  it('renders one decimal place', () => {
    expect(formatMegabytes(3 * 1024 * 1024)).toBe('3.0 MB');
    expect(formatMegabytes(1.55 * 1024 * 1024)).toBe('1.6 MB');
  });
});

describe('imageFilesFromDataTransfer', () => {
  it('returns [] for a null dataTransfer', () => {
    expect(imageFilesFromDataTransfer(null)).toEqual([]);
  });

  it('picks up a pasted screenshot', () => {
    const shot = buildFile('image.png', 'image/png');
    const files = imageFilesFromDataTransfer(
      buildDataTransfer([{ kind: 'file', file: shot }]),
    );
    expect(files).toEqual([shot]);
  });

  it('ignores the text that rides along with a copied region', () => {
    const shot = buildFile('image.png', 'image/png');
    const files = imageFilesFromDataTransfer(
      buildDataTransfer([
        { kind: 'string', file: null },
        { kind: 'file', file: shot },
      ]),
    );
    expect(files).toEqual([shot]);
  });

  it('ignores dropped non-image files', () => {
    const files = imageFilesFromDataTransfer(
      buildDataTransfer([{ kind: 'file', file: buildFile('report.pdf', 'application/pdf') }]),
    );
    expect(files).toEqual([]);
  });

  it('survives an item whose getAsFile() returns null', () => {
    const files = imageFilesFromDataTransfer(
      buildDataTransfer([{ kind: 'file', file: null }]),
    );
    expect(files).toEqual([]);
  });

  it('returns every image when several are pasted at once', () => {
    const a = buildFile('a.png', 'image/png');
    const b = buildFile('b.jpg', 'image/jpeg');
    const files = imageFilesFromDataTransfer(
      buildDataTransfer([
        { kind: 'file', file: a },
        { kind: 'file', file: b },
      ]),
    );
    expect(files).toEqual([a, b]);
  });
});
