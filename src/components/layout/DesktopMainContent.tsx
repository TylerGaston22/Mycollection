/**
 * DesktopMainContent – scrollable content area to the right of the sidebar.
 * Renders the page heading, Add/Share/Add-Subcategory buttons, and ListView.
 * Mobile uses MobileMainContent instead.
 *
 * Labels and empty-state copy come from `useMainContent`, shared with the
 * mobile tree — this file owns only the markup.
 */

import { Button } from "../ui/button";
import { ThemePrimaryButton } from "../ui/ThemePrimaryButton";
import { Plus, Share2 } from 'lucide-react';
import { Item, CustomTab, CustomSection } from "../../types";
import { ListView } from "../item/ListView";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { accentColorHoverHandlers } from "../../utils/accentHover";
import { useMainContent } from "../../hooks/useMainContent";
import { DicePicker } from "../../picker";

interface DesktopMainContentProps {
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
}

export function DesktopMainContent({
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
}: DesktopMainContentProps) {
  const {
    itemsInActiveSection,
    isEmpty,
    addButtonLabel,
    emptyStateMessageText,
    categoryHeadingTitle,
    activeSectionDescriptionText,
  } = useMainContent({
    contentType,
    activeSection,
    customTabs,
    customSections,
    getSectionContent,
  });

  let mainContentAreaDisplay;
  if (isEmpty) {
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
  } else {
    mainContentAreaDisplay = (
      <ListView
        items={itemsInActiveSection}
        contentType={contentType}
        onUpdate={onItemUpdate}
        onDelete={onItemDelete}
        onItemClick={onItemClick}
        isDarkMode={true}
        currentTheme={currentTheme}
      />
    );
  }

  return (
    <div className="flex-1 main-fluid p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-page-fg mb-2 fluid-heading">{categoryHeadingTitle}</h1>
              <p className="text-page-fg-muted">{activeSectionDescriptionText}</p>
            </div>
            {!isEmpty && (
              <Button
                onClick={onShareDialogOpen}
                variant="ghost"
                size="sm"
                style={{ color: colorToRgba(currentTheme.accentColor, 0.7) }}
                {...accentColorHoverHandlers(currentTheme, { withBackground: true })}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DicePicker
              items={itemsInActiveSection}
              contentType={contentType}
              currentTheme={currentTheme}
              onOpenItem={onItemClick}
            />

            <ThemePrimaryButton
              onClick={onAddDialogOpen}
              currentTheme={currentTheme}
              className="fluid-action-btn"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add {addButtonLabel}
            </ThemePrimaryButton>

            <Button
              onClick={onAddSectionDialogOpen}
              variant="outline"
              className="fluid-action-btn"
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

      {mainContentAreaDisplay}
    </div>
  );
}
