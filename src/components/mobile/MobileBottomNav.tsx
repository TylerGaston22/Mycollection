/**
 * MobileBottomNav – full-width bottom tab bar for mobile layout.
 * Edge-to-edge with safe area padding for iOS notch devices.
 */

import { Star, Plus, type LucideIcon } from 'lucide-react';
import { CustomTab } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { BUILT_IN_CATEGORIES } from "../../utils/builtInCategories";

interface MobileBottomNavProps {
  contentType: string;
  customTabs: CustomTab[];
  movieCount: number;
  tvShowCount: number;
  restaurantCount: number;
  placeCount: number;
  gameCount: number;
  /** Per-user visibility map keyed by content-type id. Missing entries
   *  are treated as visible. */
  visibleCategories: Record<string, boolean>;
  currentTheme: ThemeConfig;
  onContentTypeChange: (type: string) => void;
  onAddTabDialogOpen: () => void;
  items: { type: string }[];
}

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

export function MobileBottomNav({
  contentType,
  customTabs,
  movieCount,
  tvShowCount,
  restaurantCount,
  placeCount,
  gameCount,
  visibleCategories,
  currentTheme,
  onContentTypeChange,
  onAddTabDialogOpen,
  items,
}: MobileBottomNavProps) {
  // Count lookup keyed by content-type id (see Sidebar.tsx for the same
  // pattern). Mobile uses the `shortLabel` from the shared definition.
  const countById: Record<string, number> = {
    item: movieCount,
    'tv-show': tvShowCount,
    restaurant: restaurantCount,
    place: placeCount,
    game: gameCount,
  };

  const builtInTabs: TabItem[] = BUILT_IN_CATEGORIES
    .filter((category) => {
      if (visibleCategories[category.id] === false) return false;
      return true;
    })
    .map((category) => ({
      id: category.id,
      label: category.shortLabel,
      icon: category.icon,
      count: countById[category.id] ?? 0,
    }));

  const customTabItems: TabItem[] = customTabs.map((tab) => ({
    id: tab.id,
    label: tab.name,
    icon: Star,
    count: items.filter((item) => item.type === tab.id).length,
  }));

  const allTabs = [...builtInTabs, ...customTabItems];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t w-full"
      style={{
        background: currentTheme.sidebarGradient,
        borderTopColor: colorToRgba(currentTheme.accentColor, 0.2),
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        width: '100vw',
      }}
    >
      <div className="flex items-stretch">
        {allTabs.map((tab) => {
          const isActive = contentType === tab.id;
          const Icon = tab.icon;

          let tabColor = 'var(--page-fg-muted)';
          let tabBackground = 'transparent';
          if (isActive) {
            tabColor = currentTheme.accentColor;
            tabBackground = colorToRgba(currentTheme.accentColor, 0.12);
          }

          return (
            <button
              key={tab.id}
              onClick={() => onContentTypeChange(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-w-0 transition-colors"
              style={{ color: tabColor, backgroundColor: tabBackground }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate w-full text-center px-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={onAddTabDialogOpen}
          className="flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-w-0"
          style={{ color: 'var(--page-fg-faint)' }}
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] font-medium">Add</span>
        </button>
      </div>
    </nav>
  );
}
