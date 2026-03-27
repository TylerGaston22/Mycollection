/**
 * MobileHeader – Goodreads-style top bar for mobile.
 * "+" add button on the left, category title centred, profile avatar on the right.
 */

import { Plus } from 'lucide-react';
import { User as UserType } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";

interface MobileHeaderProps {
  currentUser: UserType;
  currentTheme: ThemeConfig;
  categoryTitle: string;
  onProfileDialogOpen: () => void;
  onAddDialogOpen: () => void;
}

export function MobileHeader({
  currentUser,
  currentTheme,
  categoryTitle,
  onProfileDialogOpen,
  onAddDialogOpen,
}: MobileHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md w-full"
      style={{
        background: currentTheme.sidebarGradient,
        borderBottomColor: colorToRgba(currentTheme.accentColor, 0.15),
        width: '100vw',
      }}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left: add button */}
        <button
          onClick={onAddDialogOpen}
          className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors"
          style={{
            borderColor: colorToRgba(currentTheme.accentColor, 0.4),
            color: currentTheme.accentColor,
          }}
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* Centre: title */}
        <h1 className="text-white text-lg font-semibold absolute left-1/2 -translate-x-1/2">
          {categoryTitle}
        </h1>

        {/* Right: profile avatar */}
        <button
          onClick={onProfileDialogOpen}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shadow"
          style={{
            background: `linear-gradient(to bottom right, ${currentTheme.accentColor}, ${currentTheme.accentColor}cc)`,
          }}
        >
          {currentUser.name.charAt(0)}
        </button>
      </div>
    </header>
  );
}
