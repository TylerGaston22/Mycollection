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

export function isMediaContentType(contentType: string): boolean {
  return contentType === 'item' || contentType === 'tv-show';
}

export function getWatchedLabel(contentType: string): string {
  if (isMediaContentType(contentType)) {
    return 'Watched';
  }
  return 'Visited';
}

export function getWantToSeeLabel(contentType: string): string {
  if (isMediaContentType(contentType)) {
    return 'Want to See';
  }
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

  let displayLabel: string;
  if (contentType === 'item') displayLabel = 'Item';
  else if (contentType === 'tv-show') displayLabel = 'TV Show';
  else if (contentType === 'restaurant') displayLabel = 'Restaurant';
  else if (contentType === 'place') displayLabel = 'Place';
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
  if (isMovieOrTvShowType) {
    imageUrlLabel = 'Poster URL';
  } else {
    imageUrlLabel = 'Photo URL';
  }

  // The `platform` column is reused per content type with a different
  // human-readable label. Keep these in sync with ItemDetailDialog's
  // per-type heading text + the ListView column header.
  let platformFieldLabel: string;
  let platformFieldPlaceholder: string;
  if (isMovieOrTvShowType) {
    platformFieldLabel = 'Where to Watch';
    platformFieldPlaceholder = 'Netflix, Disney+, Hulu, etc.';
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
  if (type === 'item') {
    if (plural) {
      return 'items';
    }
    return 'item';
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
  // Local re-check (not calling the exported function) to keep this function self-contained
  const isMediaContentType = contentType === 'item' || contentType === 'tv-show';
  if (sectionId === 'watched') {
    if (isMediaContentType) {
      return 'Watched';
    }
    return 'Visited';
  }
  if (sectionId === 'want-to-see') {
    if (isMediaContentType) {
      return 'Want to See';
    }
    return 'Want to Visit';
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
