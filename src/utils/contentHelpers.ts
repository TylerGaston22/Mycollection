import { Movie, CustomTab, CustomSection } from '../types';

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
