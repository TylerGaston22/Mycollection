/**
 * MobileBottomNav – full-width bottom tab bar for mobile layout.
 * Edge-to-edge with safe area padding for iOS notch devices.
 */

import { Film, Tv, UtensilsCrossed, MapPin, Star, Plus, LucideIcon } from 'lucide-react';
import { CustomTab } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";

interface MobileBottomNavProps {
  contentType: string;
  customTabs: CustomTab[];
  movieCount: number;
  tvShowCount: number;
  restaurantCount: number;
  placeCount: number;
  currentTheme: ThemeConfig;
  onContentTypeChange: (type: string) => void;
  onAddTabDialogOpen: () => void;
  movies: { type: string }[];
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
  currentTheme,
  onContentTypeChange,
  onAddTabDialogOpen,
  movies,
}: MobileBottomNavProps) {
  const builtInTabs: TabItem[] = [
    { id: 'movie', label: 'Movies', icon: Film, count: movieCount },
    { id: 'tv-show', label: 'TV Shows', icon: Tv, count: tvShowCount },
    { id: 'restaurant', label: 'Food', icon: UtensilsCrossed, count: restaurantCount },
    { id: 'place', label: 'Places', icon: MapPin, count: placeCount },
  ];

  const customTabItems: TabItem[] = customTabs.map((tab) => ({
    id: tab.id,
    label: tab.name,
    icon: Star,
    count: movies.filter((item) => item.type === tab.id).length,
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

          let tabColor = 'rgba(156, 163, 175, 0.7)';
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
          style={{ color: 'rgba(156, 163, 175, 0.5)' }}
        >
          <Plus className="h-5 w-5" />
          <span className="text-[10px] font-medium">Add</span>
        </button>
      </div>
    </nav>
  );
}
