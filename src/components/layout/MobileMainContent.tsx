/**
 * MobileMainContent – full-width content area for phone-size screens.
 * Renders the horizontal section chip nav (passed in as mobileSectionNav)
 * plus a Goodreads-style stacked list. Desktop uses DesktopMainContent.
 */

import { ReactNode } from 'react';
import { Button } from "../ui/button";
import { Plus } from 'lucide-react';
import { Item, CustomTab, CustomSection } from "../../types";
import { MobileListItem } from "../mobile/MobileListItem";
import { ThemeConfig } from "../../utils/themeConfig";
import { getContentTypeName, getWatchedLabel, getWantToSeeLabel } from "../../utils/contentHelpers";

interface MobileMainContentProps {
  items: Item[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
  contentType: string;
  activeSection: string;
  currentTheme: ThemeConfig;
  onAddDialogOpen: () => void;
  onItemUpdate: (id: string, updates: Partial<Item>) => void;
  onItemClick: (item: Item) => void;
  getSectionContent: (sectionId: string) => Item[];
  mobileSectionNav: ReactNode;
}

export function MobileMainContent({
  customTabs,
  contentType,
  activeSection,
  currentTheme,
  onAddDialogOpen,
  onItemUpdate,
  onItemClick,
  getSectionContent,
  mobileSectionNav,
}: MobileMainContentProps) {
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

  let mainContentAreaDisplay;
  if (itemsInActiveSection.length === 0) {
    mainContentAreaDisplay = (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">{emptyStateMessageText}</p>
        {activeSection === 'all' && (
          <Button
            onClick={onAddDialogOpen}
            style={{ backgroundColor: currentTheme.accentColor }}
            className="text-white hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {addButtonLabel}
          </Button>
        )}
      </div>
    );
  } else if (activeSection === 'all') {
    // Group by status section like Goodreads shelves when viewing "all"
    const watchedItems = itemsInActiveSection.filter((m) => m.status === 'watched');
    const wantToSeeItems = itemsInActiveSection.filter((m) => m.status === 'want-to-see');
    const favoriteItems = itemsInActiveSection.filter((m) => m.favorite);

    const sections: { label: string; items: Item[]; id: string }[] = [];
    if (watchedItems.length > 0) {
      sections.push({ label: getWatchedLabel(contentType), items: watchedItems, id: 'watched' });
    }
    if (wantToSeeItems.length > 0) {
      sections.push({ label: getWantToSeeLabel(contentType), items: wantToSeeItems, id: 'want-to-see' });
    }
    if (favoriteItems.length > 0) {
      sections.push({ label: 'Favorites', items: favoriteItems, id: 'favorites' });
    }

    mainContentAreaDisplay = (
      <div>
        {sections.map((section) => (
          <div key={section.id}>
            <div
              className="flex items-center justify-between px-4 py-2 border-y"
              style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                {section.label}
              </h2>
              <span className="text-white/40 text-xs">
                {section.items.length} {section.items.length === 1 ? singularTypeName : pluralTypeName}
              </span>
            </div>
            <div>
              {section.items.map((item) => (
                <div key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                  <MobileListItem
                    item={item}
                    onUpdate={onItemUpdate}
                    onClick={onItemClick}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    mainContentAreaDisplay = (
      <div>
        {itemsInActiveSection.map((item) => (
          <div key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
            <MobileListItem
              item={item}
              onUpdate={onItemUpdate}
              onClick={onItemClick}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mb-2 px-4 pt-2">
        {mobileSectionNav}
      </div>

      {mainContentAreaDisplay}
    </div>
  );
}
