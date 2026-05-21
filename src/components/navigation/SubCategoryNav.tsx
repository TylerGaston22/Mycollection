/**
 * SubCategoryNav – expandable sub-section list under a category.
 * Shows built-in sections (All, Watched/Visited, Want to See/Visit,
 * Favorites), user-created custom sections with item counts, and an
 * "Add Subcategory" button at the bottom.
 */

import { Plus } from 'lucide-react';
import { Item, CustomSection } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { accentColorHoverHandlers } from "../../utils/accentHover";
import { getWatchedLabel, getWantToSeeLabel } from "../../utils/contentHelpers";
import { SectionButton } from "./SectionButton";

interface SubCategoryNavProps {
  categoryType: string;
  contentType: string;
  activeSection: string;
  currentTheme: ThemeConfig;
  allItems: Item[];
  watchedItems: Item[];
  wantToSeeItems: Item[];
  favoriteItems: Item[];
  customSections: CustomSection[];
  onActiveSectionChange: (section: string) => void;
  onAddSectionDialogOpen: () => void;
}

export function SubCategoryNav({
  categoryType,
  contentType,
  activeSection,
  currentTheme,
  allItems,
  watchedItems,
  wantToSeeItems,
  favoriteItems,
  customSections,
  onActiveSectionChange,
  onAddSectionDialogOpen,
}: SubCategoryNavProps) {
  const customSectionsForCategory = customSections.filter((section) => section.contentType === contentType);

  return (
    <div className="mt-2 ml-6 space-y-1">
      <SectionButton
        label="All"
        count={allItems.length}
        isActive={activeSection === 'all' && contentType === categoryType} // Check both section ID and content type to prevent cross-category highlighting
        currentTheme={currentTheme}
        onClick={() => onActiveSectionChange('all')}
      />
      <SectionButton
        label={getWatchedLabel(categoryType)}
        count={watchedItems.length}
        isActive={activeSection === 'watched' && contentType === categoryType}
        currentTheme={currentTheme}
        onClick={() => onActiveSectionChange('watched')}
      />
      <SectionButton
        label={getWantToSeeLabel(categoryType)}
        count={wantToSeeItems.length}
        isActive={activeSection === 'want-to-see' && contentType === categoryType}
        currentTheme={currentTheme}
        onClick={() => onActiveSectionChange('want-to-see')}
      />
      <SectionButton
        label="Favorites"
        count={favoriteItems.length}
        isActive={activeSection === 'favorites' && contentType === categoryType}
        currentTheme={currentTheme}
        onClick={() => onActiveSectionChange('favorites')}
      />

      {customSectionsForCategory.length > 0 && (
        <div className="py-1">
          <div className="border-t border-slate-600/50"></div>
        </div>
      )}

      {customSectionsForCategory.map((section) => {
        const numberOfItemsInSection = allItems.filter((collectionItem) => collectionItem.sections?.includes(section.id)).length;
        return (
          <SectionButton
            key={section.id}
            label={section.name}
            count={numberOfItemsInSection}
            isActive={activeSection === section.id && contentType === categoryType}
            currentTheme={currentTheme}
            onClick={() => onActiveSectionChange(section.id)}
          />
        );
      })}

      <button
        onClick={() => onAddSectionDialogOpen()}
        style={{ color: colorToRgba(currentTheme.accentColor, 0.6) }}
        className="w-full text-left px-3 py-2 rounded text-sm transition-all hover:bg-slate-700/50 flex items-center gap-2"
        {...accentColorHoverHandlers(currentTheme, { restingOpacity: 0.6 })}
      >
        <Plus className="h-3 w-3" />
        Add Subcategory
      </button>
    </div>
  );
}
