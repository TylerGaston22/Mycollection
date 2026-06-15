/**
 * Tests for src/utils/csv.ts.
 * Pure functions — no React / DOM / network — so tests run in plain
 * Node via Vitest's default 'node' environment.
 */

import { describe, expect, it } from 'vitest';
import { parseCsvLine, parseCsvIntoItems, serializeItemsToCsv } from './csv';
import type { Item } from '../types';

describe('parseCsvLine', () => {
  it('splits a plain comma-separated line', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('trims surrounding whitespace on each field', () => {
    expect(parseCsvLine(' a , b , c ')).toEqual(['a', 'b', 'c']);
  });

  it('treats commas inside double quotes as content, not separators', () => {
    expect(parseCsvLine('"Hello, world",b,c')).toEqual(['Hello, world', 'b', 'c']);
  });

  it('unescapes doubled quotes inside a quoted field', () => {
    // CSV escape rule: "" inside quotes represents a single " character.
    expect(parseCsvLine('"He said ""hi""",b')).toEqual(['He said "hi"', 'b']);
  });

  it('treats a missing trailing field as an empty string', () => {
    expect(parseCsvLine('a,b,')).toEqual(['a', 'b', '']);
  });

  it('returns a single empty field for an empty line', () => {
    expect(parseCsvLine('')).toEqual(['']);
  });

  it("doesn't split on commas before the first quote opens", () => {
    // Quotes only have meaning at field boundaries; the first comma here
    // separates fields normally, then the quoted second field contains a
    // comma as content.
    expect(parseCsvLine('a,"b,c",d')).toEqual(['a', 'b,c', 'd']);
  });
});

describe('parseCsvIntoItems — error cases', () => {
  it('throws when the file has no rows', () => {
    expect(() => parseCsvIntoItems('')).toThrow(/header row/i);
  });

  it('throws when there are no data rows after the header', () => {
    expect(() => parseCsvIntoItems('title,type')).toThrow(/header row/i);
  });

  it('throws when Title column is missing', () => {
    expect(() => parseCsvIntoItems('type,status\nitem,watched')).toThrow(/title.*type/i);
  });

  it('throws when Type column is missing', () => {
    expect(() => parseCsvIntoItems('title,status\nThe Matrix,watched')).toThrow(/title.*type/i);
  });

  it('throws when every row has an unrecognised content type', () => {
    // CONTENT_TYPES is the allow-list; "magazine" isn't in it, so the
    // row is silently skipped — and with zero valid rows the function
    // raises.
    expect(() => parseCsvIntoItems('title,type\nVogue,magazine')).toThrow(/no valid items/i);
  });
});

describe('parseCsvIntoItems — happy path', () => {
  it('parses a minimal valid row', () => {
    const items = parseCsvIntoItems('title,type\nThe Matrix,item');
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: 'The Matrix',
      type: 'item',
      favorite: false,
    });
  });

  it('skips blank lines between data rows', () => {
    const items = parseCsvIntoItems(
      'title,type\nThe Matrix,item\n\nAlien,item',
    );
    expect(items.map((i) => i.title)).toEqual(['The Matrix', 'Alien']);
  });

  it('treats headers case-insensitively', () => {
    const items = parseCsvIntoItems('TITLE,Type\nDune,item');
    expect(items[0].title).toBe('Dune');
  });

  it('parses optional fields (status, platform, genre, rating, notes, posterUrl)', () => {
    const items = parseCsvIntoItems(
      [
        'title,type,status,platform,genre,rating,notes,posterurl',
        'Inception,item,watched,Netflix,Sci-Fi,5,Great film,https://image.tmdb.org/x.jpg',
      ].join('\n'),
    );
    expect(items[0]).toMatchObject({
      title: 'Inception',
      type: 'item',
      status: 'watched',
      platform: 'Netflix',
      genre: 'Sci-Fi',
      rating: 5,
      notes: 'Great film',
      posterUrl: 'https://image.tmdb.org/x.jpg',
    });
  });

  it('falls back to the default status when status is missing or invalid', () => {
    // 'completed' isn't in ITEM_STATUSES so should fall through to default.
    const items = parseCsvIntoItems(
      'title,type,status\nA,item,completed\nB,item,',
    );
    expect(items[0].status).toBe(items[1].status);
  });

  it('rejects out-of-range rating values silently', () => {
    const items = parseCsvIntoItems('title,type,rating\nA,item,99');
    expect(items[0].rating).toBeUndefined();
  });

  it('strips HTML tags from string fields', () => {
    const items = parseCsvIntoItems(
      'title,type,notes\n"<script>alert(1)</script>Hi",item,"<b>bold</b>"',
    );
    expect(items[0].title).not.toMatch(/<script>/);
    expect(items[0].notes).not.toMatch(/<b>/);
  });

  it('drops untrusted poster URLs', () => {
    // sanitizeImageUrl only allows https://image.tmdb.org and data: (per CSP).
    const items = parseCsvIntoItems(
      'title,type,posterurl\nEvil,item,javascript:alert(1)',
    );
    expect(items[0].posterUrl).toBeUndefined();
  });

  it('silently skips rows with unrecognised types but keeps the valid ones', () => {
    const items = parseCsvIntoItems(
      'title,type\nA,item\nB,unknownType\nC,tv-show',
    );
    expect(items.map((i) => i.type)).toEqual(['item', 'tv-show']);
  });

  it('handles quoted fields with embedded commas', () => {
    const items = parseCsvIntoItems(
      'title,type,notes\n"Lord of the Rings",item,"Long, epic, brilliant"',
    );
    expect(items[0].notes).toBe('Long, epic, brilliant');
  });
});

describe('serializeItemsToCsv', () => {
  const baseItem: Item = {
    id: '1',
    title: 'The Matrix',
    type: 'item',
    status: 'watched',
    favorite: false,
  };

  it('writes the standard header row first', () => {
    const csv = serializeItemsToCsv([baseItem]);
    const [header] = csv.split('\n');
    expect(header).toBe('title,type,status,platform,genre,rating,notes');
  });

  it('writes empty cells for undefined fields', () => {
    const csv = serializeItemsToCsv([baseItem]);
    const [, row] = csv.split('\n');
    expect(row).toBe('The Matrix,item,watched,,,,');
  });

  it('quotes fields that contain commas', () => {
    const csv = serializeItemsToCsv([{ ...baseItem, notes: 'A, B, C' }]);
    expect(csv).toContain('"A, B, C"');
  });

  it('doubles up internal quotes per CSV spec', () => {
    const csv = serializeItemsToCsv([{ ...baseItem, notes: 'She said "hi"' }]);
    expect(csv).toContain('"She said ""hi"""');
  });

  it('round-trips an item back through parseCsvIntoItems', () => {
    const original: Item = {
      ...baseItem,
      title: 'A, B, C',
      platform: 'Netflix',
      genre: 'Sci-Fi',
      rating: 4,
      notes: 'Includes "quotes" and, commas.',
    };
    const csv = serializeItemsToCsv([original]);
    const [back] = parseCsvIntoItems(csv);
    expect(back).toMatchObject({
      title: 'A, B, C',
      platform: 'Netflix',
      genre: 'Sci-Fi',
      rating: 4,
      notes: 'Includes "quotes" and, commas.',
      status: 'watched',
    });
  });

  it('serialises an empty array to just the header row', () => {
    expect(serializeItemsToCsv([])).toBe(
      'title,type,status,platform,genre,rating,notes',
    );
  });
});
