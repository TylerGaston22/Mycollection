/**
 * Tests for src/utils/contentHelpers.ts.
 *
 * Exercises the CONTENT_TYPE_REGISTRY refactor (todo P) — confirms every
 * built-in type returns the right metadata and that unknown / custom-tab
 * ids fall through to the shared fallback entry. Pure-function module,
 * no React / Supabase / toasts — runs in Node.
 */

import { describe, expect, it } from 'vitest';
import {
  isMediaContentType,
  isTmdbSearchableContentType,
  getWatchedLabel,
  getWantToSeeLabel,
  getStatusLabel,
  getOppositeStatusLabel,
  getContentTypeFieldConfig,
  getContentTypeName,
  getCategoryDisplayName,
  getSectionDisplayName,
  getSectionContent,
} from './contentHelpers';
import type { Item, CustomTab, CustomSection } from '../types';

// ---------------------------------------------------------------------------
// Capability flags
// ---------------------------------------------------------------------------

describe('isMediaContentType', () => {
  it.each(['item', 'tv-show', 'game'])(
    'returns true for media-ish types (%s) — Genre / Studio / Platform applies',
    (type) => {
      expect(isMediaContentType(type)).toBe(true);
    },
  );

  it.each(['restaurant', 'place'])('returns false for non-media types (%s)', (type) => {
    expect(isMediaContentType(type)).toBe(false);
  });

  it('returns false for unknown / custom-tab ids', () => {
    expect(isMediaContentType('custom-abc')).toBe(false);
    expect(isMediaContentType('totally-unknown')).toBe(false);
  });
});

describe('isTmdbSearchableContentType', () => {
  it.each(['item', 'tv-show'])('returns true for movies + tv-shows (%s)', (type) => {
    expect(isTmdbSearchableContentType(type)).toBe(true);
  });

  it('returns false for games (no TMDB game data)', () => {
    expect(isTmdbSearchableContentType('game')).toBe(false);
  });

  it.each(['restaurant', 'place', 'custom-x'])('returns false for non-media (%s)', (type) => {
    expect(isTmdbSearchableContentType(type)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Status labels
// ---------------------------------------------------------------------------

describe('getWatchedLabel / getWantToSeeLabel', () => {
  it('returns Watched / Want to See for movies + tv-shows', () => {
    expect(getWatchedLabel('item')).toBe('Watched');
    expect(getWantToSeeLabel('item')).toBe('Want to See');
    expect(getWatchedLabel('tv-show')).toBe('Watched');
    expect(getWantToSeeLabel('tv-show')).toBe('Want to See');
  });

  it('returns Visited / Want to Visit for restaurants + places', () => {
    expect(getWatchedLabel('restaurant')).toBe('Visited');
    expect(getWantToSeeLabel('place')).toBe('Want to Visit');
  });

  it('returns Played / Want to Play for games', () => {
    expect(getWatchedLabel('game')).toBe('Played');
    expect(getWantToSeeLabel('game')).toBe('Want to Play');
  });

  it('falls back to Visited / Want to Visit for unknown types', () => {
    expect(getWatchedLabel('unknown')).toBe('Visited');
    expect(getWantToSeeLabel('unknown')).toBe('Want to Visit');
  });
});

describe('getStatusLabel / getOppositeStatusLabel', () => {
  it('returns the matching label for the given status', () => {
    expect(getStatusLabel('game', 'watched')).toBe('Played');
    expect(getStatusLabel('game', 'want-to-see')).toBe('Want to Play');
  });

  it('returns the opposite label for the toggle action', () => {
    expect(getOppositeStatusLabel('game', 'watched')).toBe('Want to Play');
    expect(getOppositeStatusLabel('game', 'want-to-see')).toBe('Played');
  });
});

// ---------------------------------------------------------------------------
// Field config
// ---------------------------------------------------------------------------

describe('getContentTypeFieldConfig', () => {
  it('returns Movie labels for the legacy "item" id', () => {
    const config = getContentTypeFieldConfig('item');
    expect(config.displayLabel).toBe('Movie');
    expect(config.platformFieldLabel).toBe('Where to Watch');
    expect(config.imageUrlLabel).toBe('Poster URL');
  });

  it('returns Cuisine Type for restaurants (platform reused as cuisine)', () => {
    const config = getContentTypeFieldConfig('restaurant');
    expect(config.displayLabel).toBe('Restaurant');
    expect(config.platformFieldLabel).toBe('Cuisine Type');
    expect(config.titleFieldLabel).toBe('Name');
    expect(config.yearFieldLabel).toBe('Location');
    expect(config.imageUrlLabel).toBe('Photo URL');
  });

  it('returns Location for places', () => {
    const config = getContentTypeFieldConfig('place');
    expect(config.titleFieldLabel).toBe('Place Name');
    expect(config.platformFieldLabel).toBe('Location');
  });

  it('returns Platform (PS5/Xbox/Steam) for games + Cover URL for the image', () => {
    const config = getContentTypeFieldConfig('game');
    expect(config.displayLabel).toBe('Game');
    expect(config.platformFieldLabel).toBe('Platform');
    expect(config.imageUrlLabel).toBe('Cover URL');
    expect(config.platformFieldPlaceholder).toMatch(/PS5/);
  });

  it('falls back to generic Item labels for unknown types', () => {
    const config = getContentTypeFieldConfig('totally-unknown');
    expect(config.displayLabel).toBe('Item');
    expect(config.platformFieldLabel).toBe('Additional Info');
  });
});

// ---------------------------------------------------------------------------
// Name + category labels (custom-tab aware)
// ---------------------------------------------------------------------------

describe('getContentTypeName', () => {
  it('returns lowercase singular / plural for built-ins', () => {
    expect(getContentTypeName('item', false)).toBe('movie');
    expect(getContentTypeName('item', true)).toBe('movies');
    expect(getContentTypeName('tv-show', true)).toBe('TV shows');
    expect(getContentTypeName('restaurant', false)).toBe('restaurant');
    expect(getContentTypeName('game', true)).toBe('games');
  });

  it('resolves custom-tab ids through the customTabs lookup', () => {
    const customTabs: CustomTab[] = [{ id: 'custom-books', name: 'Books', icon: 'BookOpen' }];
    expect(getContentTypeName('custom-books', true, customTabs)).toBe('Books');
  });

  it('falls back to "items" / "item" when nothing matches', () => {
    expect(getContentTypeName('unknown', true)).toBe('items');
    expect(getContentTypeName('unknown', false)).toBe('item');
  });

  it('defaults to plural when omitted', () => {
    expect(getContentTypeName('item')).toBe('movies');
  });
});

describe('getCategoryDisplayName', () => {
  it('returns the capitalised plural label for built-ins', () => {
    expect(getCategoryDisplayName('item', [])).toBe('Movies');
    expect(getCategoryDisplayName('tv-show', [])).toBe('TV Shows');
    expect(getCategoryDisplayName('game', [])).toBe('Games');
    expect(getCategoryDisplayName('restaurant', [])).toBe('Restaurants');
  });

  it('resolves custom tab ids', () => {
    const customTabs: CustomTab[] = [{ id: 'custom-books', name: 'Books', icon: 'BookOpen' }];
    expect(getCategoryDisplayName('custom-books', customTabs)).toBe('Books');
  });

  it('falls back to "My Collection" when nothing matches', () => {
    expect(getCategoryDisplayName('unknown', [])).toBe('My Collection');
  });
});

// ---------------------------------------------------------------------------
// Section helpers
// ---------------------------------------------------------------------------

describe('getSectionDisplayName', () => {
  const noTabs: CustomTab[] = [];
  const noSections: CustomSection[] = [];

  it('returns "All <plural>" for the "all" section', () => {
    expect(getSectionDisplayName('all', 'item', noSections, noTabs)).toBe('All movies');
    expect(getSectionDisplayName('all', 'game', noSections, noTabs)).toBe('All games');
  });

  it('delegates watched / want-to-see to the per-type label helpers', () => {
    // Important: this is the bug-prone path — section labels must vary
    // per content type (Played for games, Visited for restaurants).
    expect(getSectionDisplayName('watched', 'game', noSections, noTabs)).toBe('Played');
    expect(getSectionDisplayName('want-to-see', 'restaurant', noSections, noTabs)).toBe(
      'Want to Visit',
    );
  });

  it('returns "Favorites" verbatim', () => {
    expect(getSectionDisplayName('favorites', 'item', noSections, noTabs)).toBe('Favorites');
  });

  it('resolves a matching custom section by id', () => {
    const customSections: CustomSection[] = [
      { id: 'sec-1', name: 'Date Night', contentType: 'item' },
    ];
    expect(getSectionDisplayName('sec-1', 'item', customSections, noTabs)).toBe('Date Night');
  });

  it('falls back to the raw sectionId when nothing matches', () => {
    expect(getSectionDisplayName('mystery-id', 'item', noSections, noTabs)).toBe('mystery-id');
  });
});

describe('getSectionContent', () => {
  const items: Item[] = [
    { id: '1', title: 'A', type: 'item', status: 'watched', favorite: true },
    { id: '2', title: 'B', type: 'item', status: 'want-to-see', favorite: false },
    { id: '3', title: 'C', type: 'tv-show', status: 'watched', favorite: false },
    {
      id: '4',
      title: 'D',
      type: 'item',
      status: 'want-to-see',
      favorite: false,
      sections: ['sec-1'],
    },
  ];

  it('filters by content type first — only same-type items appear regardless of section', () => {
    // Item id=3 is a tv-show; it must NEVER show in an item-section result.
    const allItems = getSectionContent('all', items, 'item');
    expect(allItems.map((i) => i.id)).toEqual(['1', '2', '4']);
  });

  it('filters by watched status within the content type', () => {
    expect(getSectionContent('watched', items, 'item').map((i) => i.id)).toEqual(['1']);
  });

  it('filters by want-to-see status within the content type', () => {
    expect(getSectionContent('want-to-see', items, 'item').map((i) => i.id)).toEqual(['2', '4']);
  });

  it('filters by the favourite flag', () => {
    expect(getSectionContent('favorites', items, 'item').map((i) => i.id)).toEqual(['1']);
  });

  it('filters by custom section membership', () => {
    expect(getSectionContent('sec-1', items, 'item').map((i) => i.id)).toEqual(['4']);
  });

  it('returns an empty list when the section id matches nothing', () => {
    expect(getSectionContent('does-not-exist', items, 'item')).toEqual([]);
  });
});
