import { Movie, CustomTab, CustomSection } from '../types';

// --- Status label helpers ---

export function isMediaContentType(contentType: string): boolean {
  return contentType === 'movie' || contentType === 'tv-show';
}

export function getWatchedLabel(contentType: string): string {
  return isMediaContentType(contentType) ? 'Watched' : 'Visited';
}

export function getWantToSeeLabel(contentType: string): string {
  return isMediaContentType(contentType) ? 'Want to See' : 'Want to Visit';
}

export function getStatusLabel(contentType: string, status: 'watched' | 'want-to-see'): string {
  if (status === 'watched') {
    return getWatchedLabel(contentType);
  }
  return getWantToSeeLabel(contentType);
}

export function getOppositeStatusLabel(contentType: string, currentStatus: 'watched' | 'want-to-see'): string {
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
  const isMedia = isMediaContentType(contentType);
  const isPlace = contentType === 'restaurant' || contentType === 'place';

  let displayLabel: string;
  if (contentType === 'movie') displayLabel = 'Movie';
  else if (contentType === 'tv-show') displayLabel = 'TV Show';
  else if (contentType === 'restaurant') displayLabel = 'Restaurant';
  else if (contentType === 'place') displayLabel = 'Place';
  else displayLabel = 'Item';

  return {
    displayLabel,
    titleFieldLabel: contentType === 'restaurant' ? 'Name' : contentType === 'place' ? 'Place Name' : 'Title',
    titleFieldWord: isPlace ? 'name' : 'title',
    yearFieldLabel: isPlace ? 'Location' : 'Year',
    yearFieldPlaceholder: isPlace ? 'City, Country' : '2024',
    imageUrlLabel: isMedia ? 'Poster URL' : 'Photo URL',
    platformFieldLabel: isMedia ? 'Where to Watch' : 'Additional Info',
    platformFieldPlaceholder: isMedia ? 'Netflix, Disney+, Hulu, etc.' : 'Additional details...',
  };
}

export function getContentTypeName(
  type: string,
  plural: boolean = true,
  customTabs: CustomTab[] = []
): string {
  if (type === 'movie') {
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
  const isMediaContentType = contentType === 'movie' || contentType === 'tv-show';
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
  if (contentType === 'movie') {
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
  movies: Movie[],
  contentType: string
): Movie[] {
  const allItemsMatchingContentType = movies.filter((collectionItem) => collectionItem.type === contentType);
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
  return allItemsMatchingContentType.filter((collectionItem) => collectionItem.sections?.includes(sectionId));
}
