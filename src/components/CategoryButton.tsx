/**
 * CategoryButton – sidebar navigation button for a content category.
 * Highlights with the theme accent colour when active, otherwise shows
 * a muted slate background. Used for both built-in and custom tab categories.
 */

import { LucideIcon } from 'lucide-react';
import { ThemeConfig } from "../utils/themeConfig";

interface CategoryButtonProps {
  label: string;
  count: number;
  icon: LucideIcon;
  isActive: boolean;
  currentTheme: ThemeConfig;
  onClick: () => void;
}

export function CategoryButton({ label, count, icon: Icon, isActive, currentTheme, onClick }: CategoryButtonProps) {
  let backgroundColor: string;
  let className: string;
  if (isActive) {
    backgroundColor = currentTheme.accentColor;
    className = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-white shadow-lg';
  } else {
    backgroundColor = 'rgba(51, 65, 85, 0.5)';
    className = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-gray-300 hover:bg-slate-700';
  }

  return (
    <button
      onClick={onClick}
      style={{ backgroundColor }}
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
