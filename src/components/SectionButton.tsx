/**
 * SectionButton – a single sub-section link inside SubCategoryNav.
 * Applies an accent-tinted background when active, or a transparent
 * hover state when inactive. Displays the section label and item count.
 */

import { ThemeConfig, colorToRgba } from "../utils/themeConfig";

interface SectionButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  currentTheme: ThemeConfig;
  onClick: () => void;
}

export function SectionButton({ label, count, isActive, currentTheme, onClick }: SectionButtonProps) {
  let backgroundColor: string;
  let textColor: string;
  let additionalClass: string;
  if (isActive) {
    backgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
    textColor = currentTheme.accentColor;
    additionalClass = 'font-medium';
  } else {
    backgroundColor = 'transparent';
    textColor = 'rgba(255, 255, 255, 0.9)';
    additionalClass = 'hover:text-white hover:bg-slate-700/50';
  }

  return (
    <button
      onClick={onClick}
      style={{ backgroundColor, color: textColor }}
      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${additionalClass}`}
    >
      {label} ({count})
    </button>
  );
}
