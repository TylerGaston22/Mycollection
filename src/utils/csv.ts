/**
 * CSV parsing and serialization for bulk import/export of items.
 * Pure functions — no UI, no toasts, no file IO. Throws on invalid input.
 */

import { Item } from '../types';
import {
  CONTENT_TYPES,
  ITEM_STATUSES,
  DEFAULT_STATUS,
  RATING_MIN,
  RATING_MAX,
  type ItemStatus,
} from '../constants';
import { stripHtml, sanitizeImageUrl } from './sanitize';

/**
 * Parses a single CSV line, respecting quoted fields with commas and escaped
 * quotes ("").
 */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

/**
 * Parses a CSV/TXT file's contents into validated Item objects.
 * Throws if the file is structurally invalid; silently skips rows with
 * unrecognised content types so a partial import can still succeed.
 */
export function parseCsvIntoItems(text: string): Item[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('File must contain a header row and at least one data row');
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  if (!headers.includes('title') || !headers.includes('type')) {
    throw new Error('CSV must include "Title" and "Type" columns');
  }

  const items: Item[] = [];
  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((name, idx) => {
      row[name] = values[idx] || '';
    });

    if (!(CONTENT_TYPES as readonly string[]).includes(row.type)) continue;

    let rating: number | undefined = undefined;
    if (row.rating) {
      const parsed = parseInt(row.rating);
      if (parsed >= RATING_MIN && parsed <= RATING_MAX) rating = parsed;
    }

    let status: ItemStatus = DEFAULT_STATUS;
    if ((ITEM_STATUSES as readonly string[]).includes(row.status)) {
      status = row.status as ItemStatus;
    }

    items.push({
      id: `bulk-${Date.now()}-${lineIndex}`,
      title: stripHtml(row.title),
      type: row.type,
      status,
      favorite: false,
      platform: row.platform ? stripHtml(row.platform) : undefined,
      genre: row.genre ? stripHtml(row.genre) : undefined,
      rating,
      notes: row.notes ? stripHtml(row.notes) : undefined,
      posterUrl: sanitizeImageUrl(row.posterurl || row.posterUrl),
    });
  }

  if (items.length === 0) {
    throw new Error('No valid items found in file');
  }

  return items;
}

/**
 * Serializes items to a CSV string with the standard column set.
 */
export function serializeItemsToCsv(items: Item[]): string {
  const headers = ['title', 'type', 'status', 'platform', 'genre', 'rating', 'notes'];
  const rows = items.map((item) =>
    headers
      .map((header) => {
        const value = item[header as keyof Item];
        if (value === undefined || value === null) return '';
        const s = String(value);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}
