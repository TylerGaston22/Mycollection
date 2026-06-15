/**
 * MobileMainContent – full-width content area for phone-size screens.
 * Renders the horizontal section chip nav (passed in as mobileSectionNav)
 * plus a Goodreads-style stacked list. Desktop uses DesktopMainContent.
 */

import { ReactNode, useState } from 'react';
import { ThemePrimaryButton } from "../ui/ThemePrimaryButton";
import { Plus } from 'lucide-react';
import { Item, CustomTab, CustomSection } from "../../types";
import { MobileListItem } from "../mobile/MobileListItem";
import { ThemeConfig } from "../../utils/themeConfig";
import { getContentTypeName, getWatchedLabel, getWantToSeeLabel } from "../../utils/contentHelpers";
import { QuickEditDialog } from "../dialogs/QuickEditDialog";

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

  // Long-press on a row opens this notes editor inline (matches the
  // desktop ListView long-press behaviour).
  const [notesItem, setNotesItem] = useState<Item | null>(null);

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
        <p className="text-page-fg-muted mb-4">{emptyStateMessageText}</p>
        {activeSection === 'all' && (
          <ThemePrimaryButton
            onClick={onAddDialogOpen}
            currentTheme={currentTheme}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {addButtonLabel}
          </ThemePrimaryButton>
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
              style={{ borderColor: 'var(--page-divider)', backgroundColor: 'var(--page-surface-subtle)' }}
            >
              <h2 className="text-page-fg-subtle text-xs font-semibold uppercase tracking-wider">
                {section.label}
              </h2>
              <span className="text-page-fg-faint text-xs">
                {section.items.length} {section.items.length === 1 ? singularTypeName : pluralTypeName}
              </span>
            </div>
            <div>
              {section.items.map((item) => (
                <div key={item.id} style={{ borderBottom: '1px solid var(--page-divider)' }}>
                  <MobileListItem
                    item={item}
                    onUpdate={onItemUpdate}
                    onClick={onItemClick}
                    onLongPress={setNotesItem}
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
          <div key={item.id} style={{ borderBottom: '1px solid var(--page-divider)' }}>
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

      <QuickEditDialog
        item={notesItem}
        field={notesItem ? 'notes' : null}
        onSave={(itemId, field, value) => onItemUpdate(itemId, { [field]: value })}
        onClose={() => setNotesItem(null)}
      />
    </div>
  );
}
