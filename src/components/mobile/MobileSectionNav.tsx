/**
 * MobileSectionNav – horizontal scrollable section chips for mobile.
 * Replaces the sidebar's expandable SubCategoryNav with a compact
 * row of filter chips (All, Watched, Want to See, Favorites, custom sections).
 */

import { Plus } from 'lucide-react';
import { Item, CustomSection } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { getWatchedLabel, getWantToSeeLabel } from "../../utils/contentHelpers";

interface MobileSectionNavProps {
  contentType: string;
  activeSection: string;
  currentTheme: ThemeConfig;
  items: Item[];
  customSections: CustomSection[];
  onActiveSectionChange: (section: string) => void;
  onAddSectionDialogOpen: () => void;
}

export function MobileSectionNav({
  contentType,
  activeSection,
  currentTheme,
  items,
  customSections,
  onActiveSectionChange,
  onAddSectionDialogOpen,
}: MobileSectionNavProps) {
  // Compute counts for each built-in section
  const allItemsInCategory = items.filter((item) => item.type === contentType);
  const watchedItems = allItemsInCategory.filter((item) => item.status === 'watched');
  const wantToSeeItems = allItemsInCategory.filter((item) => item.status === 'want-to-see');
  const favoriteItems = allItemsInCategory.filter((item) => item.favorite);

  const customSectionsForCategory = customSections.filter((s) => s.contentType === contentType);

  // Build the list of section chips
  const sections = [
    { id: 'all', label: 'All', count: allItemsInCategory.length },
    { id: 'watched', label: getWatchedLabel(contentType), count: watchedItems.length },
    { id: 'want-to-see', label: getWantToSeeLabel(contentType), count: wantToSeeItems.length },
    { id: 'favorites', label: 'Favorites', count: favoriteItems.length },
    ...customSectionsForCategory.map((section) => ({
      id: section.id,
      label: section.name,
      count: allItemsInCategory.filter((item) => item.sections?.includes(section.id)).length,
    })),
  ];

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex items-center gap-2 pb-2">
        {sections.map((section) => {
          const isActive = activeSection === section.id;

          let chipBackground = 'rgba(51, 65, 85, 0.5)';
          let chipColor = 'rgba(209, 213, 219, 0.8)';
          let chipBorder = '1px solid transparent';
          let countBackground = 'rgba(255,255,255,0.1)';

          if (isActive) {
            chipBackground = colorToRgba(currentTheme.accentColor, 0.2);
            chipColor = currentTheme.accentColor;
            chipBorder = `1px solid ${colorToRgba(currentTheme.accentColor, 0.4)}`;
            countBackground = colorToRgba(currentTheme.accentColor, 0.2);
          }

          return (
            <button
              key={section.id}
              onClick={() => onActiveSectionChange(section.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: chipBackground,
                color: chipColor,
                border: chipBorder,
              }}
            >
              {section.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: countBackground }}
              >
                {section.count}
              </span>
            </button>
          );
        })}
        <button
          onClick={onAddSectionDialogOpen}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-all"
          style={{
            color: colorToRgba(currentTheme.accentColor, 0.5),
            border: '1px dashed rgba(156, 163, 175, 0.3)',
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
