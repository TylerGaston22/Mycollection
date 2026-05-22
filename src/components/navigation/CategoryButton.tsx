/**
 * CategoryButton – sidebar navigation button for a content category.
 * Highlights with the theme accent colour when active, otherwise shows
 * a muted slate background. Used for both built-in and custom tab categories.
 */

import { LucideIcon } from 'lucide-react';
import { ThemeConfig } from "../../utils/themeConfig";

interface CategoryButtonProps {
  label: string;
  count: number;
  icon: LucideIcon;
  isActive: boolean;
  currentTheme: ThemeConfig;
  onClick: () => void;
}

// Same navy gradient used by the gear dropdown and FriendsDialog so the
// idle category buttons read as part of the site's surface palette.
const IDLE_BACKGROUND =
  'linear-gradient(to bottom right, rgb(2, 6, 23), rgb(23, 37, 84), rgb(15, 23, 42))';

export function CategoryButton({ label, count, icon: Icon, isActive, currentTheme, onClick }: CategoryButtonProps) {
  let background: string;
  let className: string;
  if (isActive) {
    background = currentTheme.accentColor;
    className = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-white shadow-lg';
  } else {
    background = IDLE_BACKGROUND;
    className = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-white hover:brightness-125';
  }

  return (
    <button
      onClick={onClick}
      style={{ background }}
      className={className}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </div>
      <span className="text-sm">{count}</span>
    </button>
  );
}
