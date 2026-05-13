/**
 * MainContent – scrollable content area to the right of the sidebar.
 * On desktop: offset by the sidebar width (ml-72), shows ListView.
 * On mobile: full-width with card grid, receives mobileSectionNav from parent.
 */

import { ReactNode } from 'react';
import { Button } from "./ui/button";
import { Plus, Share2 } from 'lucide-react';
import { Item, CustomTab, CustomSection } from "../types";
import { ItemCard } from "./ItemCard";
import { ListView } from "./ListView";
import { MobileListItem } from "./mobile/MobileListItem";
import { ThemeConfig, colorToRgba } from "../utils/themeConfig";
import { getSectionDisplayName, getContentTypeName, getCategoryDisplayName, getWatchedLabel, getWantToSeeLabel } from "../utils/contentHelpers";

interface MainContentProps {
  items: Item[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
  contentType: string;
  activeSection: string;
  currentTheme: ThemeConfig;
  onAddDialogOpen: () => void;
  onAddSectionDialogOpen: () => void;
  onShareDialogOpen: () => void;
  onItemUpdate: (id: string, updates: Partial<Item>) => void;
  onItemDelete: (id: string) => void;
  onItemClick: (item: Item) => void;
  getSectionContent: (sectionId: string) => Item[];
  isMobile?: boolean;
  mobileSectionNav?: ReactNode;
}

export function MainContent({
  customTabs,
  customSections,
  contentType,
  activeSection,
  currentTheme,
  onAddDialogOpen,
  onAddSectionDialogOpen,
  onShareDialogOpen,
  onItemUpdate,
  onItemDelete,
  onItemClick,
  getSectionContent,
  isMobile = false,
  mobileSectionNav,
}: MainContentProps) {
  const itemsInActiveSection = getSectionContent(activeSection);

  const activeSectionDescriptionText = getSectionDisplayName(activeSection, contentType, customSections, customTabs);
  const currentCategoryHeadingTitle = getCategoryDisplayName(contentType, customTabs);
  const singularTypeName = getContentTypeName(contentType, false, customTabs);
  const pluralTypeName = getContentTypeName(contentType, true, customTabs);
  // Capitalise the first letter for the "Add Item" / "Add Restaurant" button label
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
  } else if (isMobile) {
    // When showing "all", group items by status section like Goodreads shelves
    if (activeSection === 'all') {
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
              {/* Section header with top/bottom border like Goodreads */}
              <div
                className="flex items-center justify-between px-4 py-2 border-y"
                style={{ borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                  {section.label}
                </h2>
                <span className="text-white/40 text-xs">{section.items.length} {section.items.length === 1 ? singularTypeName : pluralTypeName}</span>
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
  } else {
    mainContentAreaDisplay = (
      <ListView
        items={itemsInActiveSection}
        onUpdate={onItemUpdate}
        onDelete={onItemDelete}
        onItemClick={onItemClick}
        isDarkMode={true}
        currentTheme={currentTheme}
      />
    );
  }

  // Container class: full-width on mobile, offset by sidebar on desktop
  let containerClass = 'flex-1 ml-72 p-8 overflow-y-auto';
  if (isMobile) {
    containerClass = 'flex-1 overflow-y-auto';
  }

  return (
    <div className={containerClass}>
      {/* Mobile: horizontal section chips */}
      {isMobile && mobileSectionNav && (
        <div className="mb-2 px-4 pt-2">
          {mobileSectionNav}
        </div>
      )}

      {/* Header – desktop only (mobile uses MobileHeader) */}
      {!isMobile && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-white mb-2">{currentCategoryHeadingTitle}</h1>
                <p className="text-gray-400">{activeSectionDescriptionText}</p>
              </div>
              {itemsInActiveSection.length > 0 && (
                <Button
                  onClick={onShareDialogOpen}
                  variant="ghost"
                  size="sm"
                  style={{ color: colorToRgba(currentTheme.accentColor, 0.7) }}
                  onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.currentTarget.style.color = currentTheme.accentColor;
                    event.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
                  }}
                  onMouseLeave={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.currentTarget.style.color = colorToRgba(currentTheme.accentColor, 0.7);
                    event.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onAddDialogOpen}
                style={{ backgroundColor: currentTheme.accentColor }}
                className="text-white hover:opacity-90"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add {addButtonLabel}
              </Button>

              <Button
                onClick={onAddSectionDialogOpen}
                variant="outline"
                style={{
                  borderColor: colorToRgba(currentTheme.accentColor, 0.5),
                  color: currentTheme.accentColor,
                }}
                onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.currentTarget.style.backgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
                }}
                onMouseLeave={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </Button>
            </div>
          </div>
        </div>
      )}

      {mainContentAreaDisplay}
    </div>
  );
}
