/**
 * useMainContent – the shared derivation behind DesktopMainContent and
 * MobileMainContent.
 *
 * The two components stay forked on purpose: desktop renders a sortable
 * seven-column table (ListView), mobile renders a stacked Goodreads-style
 * list. That's two information designs, not one design at two widths —
 * see `useIsMobile` for why the split is pointer-based rather than
 * width-based, and docs/ideas.md for the decision to keep it.
 *
 * What was NOT worth forking is everything above the markup: the type
 * names, the add-button label, the empty-state sentence, the status
 * grouping. Both files used to compute those independently, which is how
 * behaviour drifted between them (todo AA). Derivation lives here now;
 * the components own only their presentation.
 *
 * Callers use the subset they need — desktop ignores `statusSections`,
 * mobile ignores the heading fields. That's cheaper than a second hook.
 *
 * The work is in the pure `buildMainContent` below; the hook is a thin
 * wrapper so the derivation is testable in the repo's node-only Vitest
 * environment (same split as `utils/csv.ts` + `useDataExportImport`).
 * Deliberately NOT memoised: App builds a fresh `getSectionContent`
 * closure every render, so a `useMemo` keyed on it could never hit.
 */

import { Item, CustomTab, CustomSection } from '../types';
import {
  getContentTypeName,
  getCategoryDisplayName,
  getSectionDisplayName,
  getWatchedLabel,
  getWantToSeeLabel,
} from '../utils/contentHelpers';
import { pluralize } from '../utils/pluralize';

export interface MainContentOptions {
  contentType: string;
  activeSection: string;
  customTabs: CustomTab[];
  customSections: CustomSection[];
  /** Supplied by App — resolves a section id to the items in it. */
  getSectionContent: (sectionId: string) => Item[];
}

/** One "shelf" in the mobile all-items view: Watched / Want to see / Favorites. */
export interface StatusSection {
  id: string;
  label: string;
  items: Item[];
}

export interface MainContent {
  itemsInActiveSection: Item[];
  isEmpty: boolean;
  /** e.g. "movie" / "movies" — already resolved against custom tabs. */
  singularTypeName: string;
  pluralTypeName: string;
  /** Capitalised singular, for "Add Movie". */
  addButtonLabel: string;
  emptyStateMessageText: string;
  /** Desktop heading: the category name, e.g. "Movies". */
  categoryHeadingTitle: string;
  /** Desktop subheading: the active section, e.g. "All Movies". */
  activeSectionDescriptionText: string;
  /**
   * Status shelves for the all-items view. Empty for every other section,
   * and shelves with no items are dropped — so a caller can treat
   * `statusSections.length === 0` as "render a flat list" and never end up
   * rendering nothing.
   */
  statusSections: StatusSection[];
  /** "1 movie" / "3 movies" — the per-shelf count line. */
  formatItemCount: (count: number) => string;
}

export function buildMainContent({
  contentType,
  activeSection,
  customTabs,
  customSections,
  getSectionContent,
}: MainContentOptions): MainContent {
  const itemsInActiveSection = getSectionContent(activeSection);

  const singularTypeName = getContentTypeName(contentType, false, customTabs);
  const pluralTypeName = getContentTypeName(contentType, true, customTabs);
  const addButtonLabel = singularTypeName.charAt(0).toUpperCase() + singularTypeName.slice(1);

  let emptyStateMessageText: string;
  if (activeSection === 'all') {
    emptyStateMessageText = `No ${pluralTypeName} yet. Add your first ${singularTypeName} to get started!`;
  } else {
    emptyStateMessageText = `No ${pluralTypeName} in this section yet.`;
  }

  const statusSections: StatusSection[] = [];
  if (activeSection === 'all') {
    const watchedItems = itemsInActiveSection.filter((item) => item.status === 'watched');
    const wantToSeeItems = itemsInActiveSection.filter((item) => item.status === 'want-to-see');
    const favoriteItems = itemsInActiveSection.filter((item) => item.favorite);

    if (watchedItems.length > 0) {
      statusSections.push({ id: 'watched', label: getWatchedLabel(contentType), items: watchedItems });
    }
    if (wantToSeeItems.length > 0) {
      statusSections.push({
        id: 'want-to-see',
        label: getWantToSeeLabel(contentType),
        items: wantToSeeItems,
      });
    }
    if (favoriteItems.length > 0) {
      statusSections.push({ id: 'favorites', label: 'Favorites', items: favoriteItems });
    }
  }

  function formatItemCount(count: number): string {
    return `${count} ${pluralize(count, singularTypeName, pluralTypeName)}`;
  }

  return {
    itemsInActiveSection,
    isEmpty: itemsInActiveSection.length === 0,
    singularTypeName,
    pluralTypeName,
    addButtonLabel,
    emptyStateMessageText,
    categoryHeadingTitle: getCategoryDisplayName(contentType, customTabs),
    activeSectionDescriptionText: getSectionDisplayName(
      activeSection,
      contentType,
      customSections,
      customTabs,
    ),
    statusSections,
    formatItemCount,
  };
}

export function useMainContent(options: MainContentOptions): MainContent {
  return buildMainContent(options);
}
