/**
 * CategoryButton – sidebar navigation button for a content category.
 * Highlights with the theme accent colour when active, otherwise shows
 * a muted slate background. Used for both built-in and custom tab categories.
 */

import { LucideIcon } from 'lucide-react';
import { ThemeConfig } from "../../utils/themeConfig";
import { NAVY_SURFACE_BACKGROUND } from "../../utils/surfaceBackgrounds";
import { NAV_HOVER_CLASS } from "../../utils/hoverStyles";

interface CategoryButtonProps {
  label: string;
  count: number;
  icon: LucideIcon;
  isActive: boolean;
  currentTheme: ThemeConfig;
  onClick: () => void;
}

export function CategoryButton({ label, count, icon: Icon, isActive, currentTheme, onClick }: CategoryButtonProps) {
  let background: string;
  let className: string;
  if (isActive) {
    background = currentTheme.accentColor;
    className = 'w-full flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer text-white shadow-lg';
  } else {
    background = NAVY_SURFACE_BACKGROUND;
    className = `w-full flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer text-white ${NAV_HOVER_CLASS}`;
  }

  return (
    <button
      onClick={onClick}
      style={{ background }}
      className={className}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Icon className="h-5 w-5 shrink-0" />
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
      </div>
      <span className="shrink-0 ml-2">{count}</span>
    </button>
  );
}
