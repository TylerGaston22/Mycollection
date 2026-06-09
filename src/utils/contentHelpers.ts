/**
 * Content-type helper utilities.
 *
 * Centralises all logic that varies by content type (item, tv-show,
 * restaurant, place, or custom tab) so that UI components don't need
 * to duplicate if/else branches for labels, field names, and filtering.
 */

import { Item, CustomTab, CustomSection } from '../types';
import type { ItemStatus } from '../constants';

// --- Status label helpers ---

/**
 * "Media-ish" content types — share rich-metadata fields like Genre,
 * Studio, and a stylised Platform label. Drives UI scoping: ListView
 * Genre column, ItemFormDialog optional Studio/Genre inputs,
 * ItemDetailDialog Studio/Genre blocks. Includes Movies, TV Shows,
 * and Games (which all have Genre/Studio/Platform); excludes
 * Restaurants and Places (where Platform is re-labelled to Cuisine
 * Type / Location and Genre/Studio don't apply).
 */
export function isMediaContentType(contentType: string): boolean {
  return contentType === 'item' || contentType === 'tv-show' || contentType === 'game';
}

/**
 * Whether TMDB lookup applies to this content type. TMDB only knows
 * Movies + TV Shows — not Games or any other category. Keep separate
 * from isMediaContentType so adding "media-ish" types in the future
 * doesn't accidentally turn TMDB search on for them.
 */
export function isTmdbSearchableContentType(contentType: string): boolean {
  return contentType === 'item' || contentType === 'tv-show';
}

export function getWatchedLabel(contentType: string): string {
  if (contentType === 'game') return 'Played';
  if (isMediaContentType(contentType)) return 'Watched';
  return 'Visited';
}

export function getWantToSeeLabel(contentType: string): string {
  if (contentType === 'game') return 'Want to Play';
  if (isMediaContentType(contentType)) return 'Want to See';
  return 'Want to Visit';
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

// --- Content type field config (for forms) ---

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
  const isMovieOrTvShowType = isMediaContentType(contentType);
  // Restaurants and places share field labels ("Name" instead of "Title", "Location" instead of "Year")
  const isRestaurantOrPlaceType = contentType === 'restaurant' || contentType === 'place';

  // The built-in 'item' content type is the Movies category (legacy id
  // from when the app shipped as a movie tracker). Its user-facing label
  // is "Movie", but the id stays 'item' for backwards compatibility with
  // existing DB rows.
  let displayLabel: string;
  if (contentType === 'item') displayLabel = 'Movie';
  else if (contentType === 'tv-show') displayLabel = 'TV Show';
  else if (contentType === 'restaurant') displayLabel = 'Restaurant';
  else if (contentType === 'place') displayLabel = 'Place';
  else if (contentType === 'game') displayLabel = 'Game';
  else displayLabel = 'Item';

  let titleFieldLabel: string;
  if (contentType === 'restaurant') {
    titleFieldLabel = 'Name';
  } else if (contentType === 'place') {
    titleFieldLabel = 'Place Name';
  } else {
    titleFieldLabel = 'Title';
  }

  let titleFieldWord: string;
  if (isRestaurantOrPlaceType) {
    titleFieldWord = 'name';
  } else {
    titleFieldWord = 'title';
  }

  let yearFieldLabel: string;
  if (isRestaurantOrPlaceType) {
    yearFieldLabel = 'Location';
  } else {
    yearFieldLabel = 'Year';
  }

  let yearFieldPlaceholder: string;
  if (isRestaurantOrPlaceType) {
    yearFieldPlaceholder = 'City, Country';
  } else {
    yearFieldPlaceholder = '2024';
  }

  let imageUrlLabel: string;
  if (contentType === 'game') {
    imageUrlLabel = 'Cover URL';
  } else if (isMovieOrTvShowType) {
    imageUrlLabel = 'Poster URL';
  } else {
    imageUrlLabel = 'Photo URL';
  }

  // The `platform` column is reused per content type with a different
  // human-readable label. Keep these in sync with ItemDetailDialog's
  // per-type heading text + the ListView column header.
  let platformFieldLabel: string;
  let platformFieldPlaceholder: string;
  if (contentType === 'item' || contentType === 'tv-show') {
    platformFieldLabel = 'Where to Watch';
    platformFieldPlaceholder = 'Netflix, Disney+, Hulu, etc.';
  } else if (contentType === 'game') {
    platformFieldLabel = 'Platform';
    platformFieldPlaceholder = 'PS5, Xbox, Steam, Switch, etc.';
  } else if (contentType === 'restaurant') {
    platformFieldLabel = 'Cuisine Type';
    platformFieldPlaceholder = 'Italian, Thai, Mexican, etc.';
  } else if (contentType === 'place') {
    platformFieldLabel = 'Location';
    platformFieldPlaceholder = 'City / neighbourhood';
  } else {
    platformFieldLabel = 'Additional Info';
    platformFieldPlaceholder = 'Additional details...';
  }

  return {
    displayLabel,
    titleFieldLabel,
    titleFieldWord,
    yearFieldLabel,
    yearFieldPlaceholder,
    imageUrlLabel,
    platformFieldLabel,
    platformFieldPlaceholder,
  };
}

export function getContentTypeName(
  type: string,
  plural: boolean = true,
  customTabs: CustomTab[] = []
): string {
  // 'item' is the legacy id for the Movies category; user-facing
  // singular/plural should read as "movie" / "movies".
  if (type === 'item') {
    if (plural) {
      return 'movies';
    }
    return 'movie';
  }
  if (type === 'tv-show') {
    if (plural) {
      return 'TV shows';
    }
    return 'TV show';
  }
  if (type === 'restaurant') {
    if (plural) {
      return 'restaurants';
    }
    return 'restaurant';
  }
  if (type === 'place') {
    if (plural) {
      return 'places';
    }
    return 'place';
  }
  if (type === 'game') {
    if (plural) {
      return 'games';
    }
    return 'game';
  }
  const matchingCustomTab = customTabs.find((tab) => tab.id === type);
  if (matchingCustomTab) {
    return matchingCustomTab.name;
  }
  if (plural) {
    return 'items';
  }
  return 'item';
}

export function getSectionDisplayName(
  sectionId: string,
  contentType: string,
  customSections: CustomSection[],
  customTabs: CustomTab[]
): string {
  if (sectionId === 'all') {
    return `All ${getContentTypeName(contentType, true, customTabs)}`;
  }
  // Built-in section labels vary by content type. Delegate to the
  // shared helpers so games render as Played / Want to Play, etc.
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

export function getCategoryDisplayName(contentType: string, customTabs: CustomTab[]): string {
  if (contentType === 'item') {
    return 'Movies';
  }
  if (contentType === 'tv-show') {
    return 'TV Shows';
  }
  if (contentType === 'restaurant') {
    return 'Restaurants';
  }
  if (contentType === 'place') {
    return 'Places';
  }
  if (contentType === 'game') {
    return 'Games';
  }
  const matchingCustomTab = customTabs.find((tab) => tab.id === contentType);
  if (matchingCustomTab) {
    return matchingCustomTab.name;
  }
  return 'My Collection';
}

export function getSectionContent(
  sectionId: string,
  items: Item[],
  contentType: string
): Item[] {
  const allItemsMatchingContentType = items.filter((collectionItem) => collectionItem.type === contentType);
  if (sectionId === 'all') {
    return allItemsMatchingContentType;
  }
  if (sectionId === 'watched') {
    return allItemsMatchingContentType.filter((collectionItem) => collectionItem.status === 'watched');
  }
  if (sectionId === 'want-to-see') {
    return allItemsMatchingContentType.filter((collectionItem) => collectionItem.status === 'want-to-see');
  }
  if (sectionId === 'favorites') {
    return allItemsMatchingContentType.filter((collectionItem) => collectionItem.favorite);
  }
  // For custom sections, filter items whose sections array includes this section ID
  return allItemsMatchingContentType.filter((collectionItem) => collectionItem.sections?.includes(sectionId));
}
