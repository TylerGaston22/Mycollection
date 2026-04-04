/**
 * sanitize – input validation and sanitization utilities.
 * Provides URL validation, string sanitization, and schema
 * validation for imported data to prevent XSS and injection.
 */

import { Movie, CustomTab, CustomSection } from '../types';

/**
 * Returns true if the given string is a safe HTTP(S) image URL.
 * Rejects javascript:, data:, and other dangerous protocols.
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns the URL if it's a valid HTTP(S) URL, otherwise undefined.
 * Use this to sanitize user-provided image URLs before rendering.
 */
export function sanitizeImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (isValidImageUrl(url)) return url;
  return undefined;
}

/**
 * Strips HTML tags from a string to prevent stored XSS via imports.
 */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes a string field: trims whitespace and strips HTML tags.
 */
function sanitizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = stripHtml(value.trim());
  if (cleaned.length === 0) return undefined;
  return cleaned;
}

/**
 * Validates and sanitizes a single imported Movie object.
 * Returns null if the item is invalid (missing required fields).
 */
export function validateMovie(item: unknown): Movie | null {
  if (typeof item !== 'object' || item === null) return null;

  const raw = item as Record<string, unknown>;

  const title = sanitizeString(raw.title);
  if (!title) return null;

  const type = sanitizeString(raw.type);
  if (!type) return null;

  const validStatuses = ['watched', 'want-to-see'];
  let status: 'watched' | 'want-to-see' = 'want-to-see';
  if (typeof raw.status === 'string' && validStatuses.includes(raw.status)) {
    status = raw.status as 'watched' | 'want-to-see';
  }

  let rating: number | undefined = undefined;
  if (typeof raw.rating === 'number' && raw.rating >= 1 && raw.rating <= 5) {
    rating = Math.floor(raw.rating);
  }

  let favorite = false;
  if (typeof raw.favorite === 'boolean') {
    favorite = raw.favorite;
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : `import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    type,
    status,
    favorite,
    rating,
    year: sanitizeString(raw.year),
    posterUrl: sanitizeImageUrl(typeof raw.posterUrl === 'string' ? raw.posterUrl : undefined),
    platform: sanitizeString(raw.platform),
    studio: sanitizeString(raw.studio),
    genre: sanitizeString(raw.genre),
    notes: sanitizeString(raw.notes),
    seasons: typeof raw.seasons === 'number' ? Math.floor(raw.seasons) : undefined,
    episodes: typeof raw.episodes === 'number' ? Math.floor(raw.episodes) : undefined,
    sections: Array.isArray(raw.sections) ? raw.sections.filter((s): s is string => typeof s === 'string') : undefined,
  };
}

/**
 * Validates and sanitizes a single imported CustomTab object.
 */
export function validateCustomTab(item: unknown): CustomTab | null {
  if (typeof item !== 'object' || item === null) return null;

  const raw = item as Record<string, unknown>;

  const id = sanitizeString(raw.id);
  const name = sanitizeString(raw.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    icon: sanitizeString(raw.icon) || 'Star',
  };
}

/**
 * Validates and sanitizes a single imported CustomSection object.
 */
export function validateCustomSection(item: unknown): CustomSection | null {
  if (typeof item !== 'object' || item === null) return null;

  const raw = item as Record<string, unknown>;

  const id = sanitizeString(raw.id);
  const name = sanitizeString(raw.name);
  const contentType = sanitizeString(raw.contentType);
  if (!id || !name || !contentType) return null;

  return { id, name, contentType };
}

/**
 * Parses a CSV line respecting quoted fields.
 * Handles commas within quoted values and escaped quotes ("").
 */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped quote ""
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
