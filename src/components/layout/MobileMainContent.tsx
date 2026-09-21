/**
 * MobileMainContent – full-width content area for phone-size screens.
 * Renders the horizontal section chip nav (passed in as mobileSectionNav)
 * plus a Goodreads-style stacked list. Desktop uses DesktopMainContent.
 *
 * Labels, grouping, and empty-state copy come from `useMainContent`,
 * shared with the desktop tree — this file owns only the markup.
 */

import { ReactNode, useState } from 'react';
import { ThemePrimaryButton } from "../ui/ThemePrimaryButton";
import { Plus } from 'lucide-react';
import { Item, CustomTab, CustomSection } from "../../types";
import { MobileListItem } from "../mobile/MobileListItem";
import { ThemeConfig } from "../../utils/themeConfig";
import { useMainContent } from "../../hooks/useMainContent";
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
  customSections,
  contentType,
  activeSection,
  currentTheme,
  onAddDialogOpen,
  onItemUpdate,
  onItemClick,
  getSectionContent,
  mobileSectionNav,
}: MobileMainContentProps) {
  const {
    itemsInActiveSection,
    isEmpty,
    addButtonLabel,
    emptyStateMessageText,
    statusSections,
    formatItemCount,
  } = useMainContent({
    contentType,
    activeSection,
    customTabs,
    customSections,
    getSectionContent,
  });

  // Long-press on a row opens this notes editor inline (matches the
  // desktop ListView long-press behaviour).
  const [notesItem, setNotesItem] = useState<Item | null>(null);

  function renderRow(item: Item) {
    return (
      <div key={item.id} style={{ borderBottom: '1px solid var(--page-divider)' }}>
        <MobileListItem
          item={item}
          onUpdate={onItemUpdate}
          onClick={onItemClick}
          onLongPress={setNotesItem}
        />
      </div>
    );
  }

  function renderMainContentArea() {
    if (isEmpty) {
      return (
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
    }

    // Group by status like Goodreads shelves when viewing "all".
    if (statusSections.length > 0) {
      return (
        <div>
          {statusSections.map((section) => (
            <div key={section.id}>
              <div
                className="flex items-center justify-between px-4 py-2 border-y"
                style={{ borderColor: 'var(--page-divider)', backgroundColor: 'var(--page-surface-subtle)' }}
              >
                <h2 className="text-page-fg-subtle text-xs font-semibold uppercase tracking-wider">
                  {section.label}
                </h2>
                <span className="text-page-fg-faint text-xs">
                  {formatItemCount(section.items.length)}
                </span>
              </div>
              <div>{section.items.map(renderRow)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <div>{itemsInActiveSection.map(renderRow)}</div>;
  }

  // No ternaries (docs/coding-standards.md #6) — QuickEditDialog treats a
  // null field as "closed", so the two pieces of state move together.
  let notesFieldOrClosed: 'notes' | null = null;
  if (notesItem) notesFieldOrClosed = 'notes';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mb-2 px-4 pt-2">
        {mobileSectionNav}
      </div>

      {renderMainContentArea()}

      <QuickEditDialog
        item={notesItem}
        field={notesFieldOrClosed}
        onSave={onItemUpdate}
        onClose={() => setNotesItem(null)}
      />
    </div>
  );
}
