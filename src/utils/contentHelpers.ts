/**
 * Content-type helper utilities.
 *
 * The per-content-type metadata (labels, field placeholders, capability
 * flags like "uses TMDB", "has Genre/Studio fields") lives in a single
 * registry (`CONTENT_TYPE_REGISTRY` below). The exported helpers are
 * thin lookups into that registry — adding a new built-in category is
 * one new entry, not seven scattered if/else additions.
 *
 * Custom tabs (user-created top-level categories) DON'T appear in the
 * registry — they fall through to `FALLBACK_REGISTRY_ENTRY` and resolve
 * their display name via the customTabs array passed to the relevant
 * helpers.
 */

import { Item, CustomTab, CustomSection } from '../types';
import type { ItemStatus } from '../constants';

// ---------------------------------------------------------------------------
// Per-type registry — single source of truth for content-type metadata.
// ---------------------------------------------------------------------------

interface ContentTypeRegistryEntry {
  /** Plural category heading: "Movies" / "TV Shows" / "Restaurants" / … */
  categoryLabel: string;
  /** Singular display label used in dialog titles: "Movie" / "TV Show" / … */
  displayLabel: string;
  /** Lowercase singular for prose: "movie" / "tv show" / "restaurant" / … */
  nameSingular: string;
  /** Lowercase plural for prose: "movies" / "tv shows" / "restaurants" / … */
  namePlural: string;

  /** Status labels — vary per type (Watched vs Visited vs Played). */
  watchedLabel: string;
  wantToSeeLabel: string;

  /** Form field labels + placeholders. */
  titleFieldLabel: string;
  titleFieldWord: string;
  yearFieldLabel: string;
  yearFieldPlaceholder: string;
  imageUrlLabel: string;
  platformFieldLabel: string;
  platformFieldPlaceholder: string;

  /** True when this type shows Genre / Studio fields and the "Where to
   *  Watch"-style platform label (i.e. media-ish). Drives ListView's
   *  genre-column include + ItemFormDialog's optional fields. */
  isMedia: boolean;
  /** True when TMDB lookup applies (Movies, TV Shows only). */
  usesTmdb: boolean;
}

/** Default fallback used for custom tabs and unknown content types. */
const FALLBACK_REGISTRY_ENTRY: ContentTypeRegistryEntry = {
  categoryLabel: 'My Collection',
  displayLabel: 'Item',
  nameSingular: 'item',
  namePlural: 'items',
  watchedLabel: 'Visited',
  wantToSeeLabel: 'Want to Visit',
  titleFieldLabel: 'Title',
  titleFieldWord: 'title',
  yearFieldLabel: 'Year',
  yearFieldPlaceholder: '2024',
  imageUrlLabel: 'Photo URL',
  platformFieldLabel: 'Additional Info',
  platformFieldPlaceholder: 'Additional details...',
  isMedia: false,
  usesTmdb: false,
};

const CONTENT_TYPE_REGISTRY: Record<string, ContentTypeRegistryEntry> = {
  // 'item' is the legacy id for the Movies category (the app shipped
  // as a movie tracker first; the id stays for back-compat with
  // existing DB rows).
  item: {
    categoryLabel: 'Movies',
    displayLabel: 'Movie',
    nameSingular: 'movie',
    namePlural: 'movies',
    watchedLabel: 'Watched',
    wantToSeeLabel: 'Want to See',
    titleFieldLabel: 'Title',
    titleFieldWord: 'title',
    yearFieldLabel: 'Year',
    yearFieldPlaceholder: '2024',
    imageUrlLabel: 'Poster URL',
    platformFieldLabel: 'Where to Watch',
    platformFieldPlaceholder: 'Netflix, Disney+, Hulu, etc.',
    isMedia: true,
    usesTmdb: true,
  },
  'tv-show': {
    categoryLabel: 'TV Shows',
    displayLabel: 'TV Show',
    nameSingular: 'TV show',
    namePlural: 'TV shows',
    watchedLabel: 'Watched',
    wantToSeeLabel: 'Want to See',
    titleFieldLabel: 'Title',
    titleFieldWord: 'title',
    yearFieldLabel: 'Year',
    yearFieldPlaceholder: '2024',
    imageUrlLabel: 'Poster URL',
    platformFieldLabel: 'Where to Watch',
    platformFieldPlaceholder: 'Netflix, Disney+, Hulu, etc.',
    isMedia: true,
    usesTmdb: true,
  },
  restaurant: {
    categoryLabel: 'Restaurants',
    displayLabel: 'Restaurant',
    nameSingular: 'restaurant',
    namePlural: 'restaurants',
    watchedLabel: 'Visited',
    wantToSeeLabel: 'Want to Visit',
    titleFieldLabel: 'Name',
    titleFieldWord: 'name',
    yearFieldLabel: 'Location',
    yearFieldPlaceholder: 'City, Country',
    imageUrlLabel: 'Photo URL',
    platformFieldLabel: 'Cuisine Type',
    platformFieldPlaceholder: 'Italian, Thai, Mexican, etc.',
    isMedia: false,
    usesTmdb: false,
  },
  place: {
    categoryLabel: 'Places',
    displayLabel: 'Place',
    nameSingular: 'place',
    namePlural: 'places',
    watchedLabel: 'Visited',
    wantToSeeLabel: 'Want to Visit',
    titleFieldLabel: 'Place Name',
    titleFieldWord: 'name',
    yearFieldLabel: 'Location',
    yearFieldPlaceholder: 'City, Country',
    imageUrlLabel: 'Photo URL',
    platformFieldLabel: 'Location',
    platformFieldPlaceholder: 'City / neighbourhood',
    isMedia: false,
    usesTmdb: false,
  },
  game: {
    categoryLabel: 'Games',
    displayLabel: 'Game',
    nameSingular: 'game',
    namePlural: 'games',
    watchedLabel: 'Played',
    wantToSeeLabel: 'Want to Play',
    titleFieldLabel: 'Title',
    titleFieldWord: 'title',
    yearFieldLabel: 'Year',
    yearFieldPlaceholder: '2024',
    imageUrlLabel: 'Cover URL',
    platformFieldLabel: 'Platform',
    platformFieldPlaceholder: 'PS5, Xbox, Steam, Switch, etc.',
    isMedia: true,
    usesTmdb: false,
  },
};

/** Read the registry entry for a content type, falling back to the
 *  default for unknown ids (custom tabs and anything not registered). */
function entryFor(contentType: string): ContentTypeRegistryEntry {
  const entry = CONTENT_TYPE_REGISTRY[contentType];
  if (entry) return entry;
  return FALLBACK_REGISTRY_ENTRY;
}

// ---------------------------------------------------------------------------
// Capability checks
// ---------------------------------------------------------------------------

/**
 * "Media-ish" content types — share rich-metadata fields like Genre,
 * Studio, and a stylised Platform label. Drives UI scoping: ListView
 * Genre column, ItemFormDialog optional Studio/Genre inputs,
 * ItemDetailDialog Studio/Genre blocks.
 */
export function isMediaContentType(contentType: string): boolean {
  return entryFor(contentType).isMedia;
}

/**
 * Whether TMDB lookup applies to this content type. TMDB only knows
 * Movies + TV Shows — kept separate from isMediaContentType so adding
 * more "media-ish" types in the future doesn't accidentally turn TMDB
 * search on for them.
 */
export function isTmdbSearchableContentType(contentType: string): boolean {
  return entryFor(contentType).usesTmdb;
}

// ---------------------------------------------------------------------------
// Status label helpers
// ---------------------------------------------------------------------------

export function getWatchedLabel(contentType: string): string {
  return entryFor(contentType).watchedLabel;
}

export function getWantToSeeLabel(contentType: string): string {
  return entryFor(contentType).wantToSeeLabel;
}

export function getStatusLabel(contentType: string, status: ItemStatus): string {
  if (status === 'watched') {
    return getWatchedLabel(contentType);
  }
  return getWantToSeeLabel(contentType);
}

export function getOppositeStatusLabel(contentType: string, currentStatus: ItemStatus): string {
  if (currentStatus === 'watched') {
    return getWantToSeeLabel(contentType);
  }
  return getWatchedLabel(contentType);
}

// ---------------------------------------------------------------------------
// Form field config
// ---------------------------------------------------------------------------

export interface ContentTypeFieldConfig {
  displayLabel: string;
  titleFieldLabel: string;
  titleFieldWord: string;
  yearFieldLabel: string;
  yearFieldPlaceholder: string;
  imageUrlLabel: string;
  platformFieldLabel: string;
  platformFieldPlaceholder: string;
}

export function getContentTypeFieldConfig(contentType: string): ContentTypeFieldConfig {
  const entry = entryFor(contentType);
  return {
    displayLabel: entry.displayLabel,
    titleFieldLabel: entry.titleFieldLabel,
    titleFieldWord: entry.titleFieldWord,
    yearFieldLabel: entry.yearFieldLabel,
    yearFieldPlaceholder: entry.yearFieldPlaceholder,
    imageUrlLabel: entry.imageUrlLabel,
    platformFieldLabel: entry.platformFieldLabel,
    platformFieldPlaceholder: entry.platformFieldPlaceholder,
  };
}

// ---------------------------------------------------------------------------
// Name + category lookups (custom-tab aware)
// ---------------------------------------------------------------------------

export function getContentTypeName(
  type: string,
  plural: boolean = true,
  customTabs: CustomTab[] = [],
): string {
  // Registered (built-in) types use their registry entry directly.
  const registered = CONTENT_TYPE_REGISTRY[type];
  if (registered) {
    if (plural) return registered.namePlural;
    return registered.nameSingular;
  }
  // Custom tabs override the fallback if a matching one was passed.
  const matchingCustomTab = customTabs.find((tab) => tab.id === type);
  if (matchingCustomTab) {
    return matchingCustomTab.name;
  }
  if (plural) return FALLBACK_REGISTRY_ENTRY.namePlural;
  return FALLBACK_REGISTRY_ENTRY.nameSingular;
}

export function getCategoryDisplayName(contentType: string, customTabs: CustomTab[]): string {
  const registered = CONTENT_TYPE_REGISTRY[contentType];
  if (registered) {
    return registered.categoryLabel;
  }
  const matchingCustomTab = customTabs.find((tab) => tab.id === contentType);
  if (matchingCustomTab) {
    return matchingCustomTab.name;
  }
  return FALLBACK_REGISTRY_ENTRY.categoryLabel;
}

// ---------------------------------------------------------------------------
// Section helpers
// ---------------------------------------------------------------------------

export function getSectionDisplayName(
  sectionId: string,
  contentType: string,
  customSections: CustomSection[],
  customTabs: CustomTab[],
): string {
  if (sectionId === 'all') {
    return `All ${getContentTypeName(contentType, true, customTabs)}`;
  }
  if (sectionId === 'watched') {
    return getWatchedLabel(contentType);
  }
  if (sectionId === 'want-to-see') {
    return getWantToSeeLabel(contentType);
  }
  if (sectionId === 'favorites') {
    return 'Favorites';
  }
  const matchingCustomSection = customSections.find((section) => section.id === sectionId);
  if (matchingCustomSection) {
    return matchingCustomSection.name;
  }
  return sectionId;
}

export function getSectionContent(
  sectionId: string,
  items: Item[],
  contentType: string,
): Item[] {
  const allItemsMatchingContentType = items.filter(
    (collectionItem) => collectionItem.type === contentType,
  );
  if (sectionId === 'all') {
    return allItemsMatchingContentType;
  }
  if (sectionId === 'watched') {
    return allItemsMatchingContentType.filter(
      (collectionItem) => collectionItem.status === 'watched',
    );
  }
  if (sectionId === 'want-to-see') {
    return allItemsMatchingContentType.filter(
      (collectionItem) => collectionItem.status === 'want-to-see',
    );
  }
  if (sectionId === 'favorites') {
    return allItemsMatchingContentType.filter((collectionItem) => collectionItem.favorite);
  }
  // For custom sections, filter items whose sections array includes this section ID
  return allItemsMatchingContentType.filter((collectionItem) =>
    collectionItem.sections?.includes(sectionId),
  );
}
