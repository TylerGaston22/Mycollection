/**
 * SectionButton – a single sub-section link inside SubCategoryNav.
 * Applies an accent-tinted background when active, or no inline
 * background when inactive so NAV_HOVER_CLASS's hover overlay can
 * actually show through (inline styles beat hover: utilities).
 */

import type { CSSProperties } from "react";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { NAV_HOVER_CLASS } from "../../utils/hoverStyles";

interface SectionButtonProps {
  label: string;
  count: number;
  isActive: boolean;
  currentTheme: ThemeConfig;
  onClick: () => void;
}

export function SectionButton({ label, count, isActive, currentTheme, onClick }: SectionButtonProps) {
  let style: CSSProperties;
  let additionalClass: string;
  if (isActive) {
    style = {
      backgroundColor: colorToRgba(currentTheme.accentColor, 0.2),
      color: currentTheme.accentColor,
    };
    additionalClass = 'font-medium';
  } else {
    // No inline backgroundColor — leave it to CSS so the hover utility
    // can paint the page-surface overlay over it. Text uses the page-fg
    // tokens so it reads on both the dark sidebars and the cream Coffee one.
    style = { color: 'var(--page-fg-subtle)' };
    additionalClass = `hover:text-page-fg ${NAV_HOVER_CLASS}`;
  }

  return (
    <button
      onClick={onClick}
      style={style}
      className={`w-full text-left px-3 py-2 rounded text-sm transition-all cursor-pointer ${additionalClass}`}
    >
      {label} ({count})
    </button>
  );
}
