import { Movie } from '../types/movie';
import { CustomTab } from '../types/customTab';
import { CustomSection } from '../types/customSection';

export function getContentTypeName(
  type: string,
  plural: boolean = true,
  customTabs: CustomTab[] = []
): string {
  if (type === 'movie') return plural ? 'movies' : 'movie';
  if (type === 'tv-show') return plural ? 'TV shows' : 'TV show';
  if (type === 'restaurant') return plural ? 'restaurants' : 'restaurant';
  if (type === 'place') return plural ? 'places' : 'place';
  const tab = customTabs.find(t => t.id === type);
  return tab?.name || (plural ? 'items' : 'item');
}

export function getSectionDisplayName(
  sectionId: string,
  contentType: string,
  customSections: CustomSection[],
  customTabs: CustomTab[]
): string {
  if (sectionId === 'all') return `All ${getContentTypeName(contentType, true, customTabs)}`;
  if (sectionId === 'watched') return (contentType === 'movie' || contentType === 'tv-show') ? 'Watched' : 'Visited';
  if (sectionId === 'want-to-see') return (contentType === 'movie' || contentType === 'tv-show') ? 'Want to See' : 'Want to Visit';
  if (sectionId === 'favorites') return 'Favorites';
  return customSections.find(s => s.id === sectionId)?.name || sectionId;
}

export function getCategoryDisplayName(contentType: string, customTabs: CustomTab[]): string {
  if (contentType === 'movie') return 'Movies';
  if (contentType === 'tv-show') return 'TV Shows';
  if (contentType === 'restaurant') return 'Restaurants';
  if (contentType === 'place') return 'Places';
  return customTabs.find(t => t.id === contentType)?.name || 'My Collection';
}

export function getSectionContent(
  sectionId: string,
  movies: Movie[],
  contentType: string
): Movie[] {
  const current = movies.filter(m => m.type === contentType);
  if (sectionId === 'all') return current;
  if (sectionId === 'watched') return current.filter(m => m.status === 'watched');
  if (sectionId === 'want-to-see') return current.filter(m => m.status === 'want-to-see');
  if (sectionId === 'favorites') return current.filter(m => m.favorite);
  return current.filter(m => m.sections?.includes(sectionId));
}
