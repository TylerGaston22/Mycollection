/**
 * MobileHeader – Goodreads-style top bar for mobile.
 * "+" add button on the left, category title centred, avatar on the
 * right. Tapping the avatar opens the shared UserMenu (Friends /
 * Settings / theme toggles / log-out) so mobile users can reach the
 * same actions the desktop sidebar gear icon exposes.
 */

import { Plus } from 'lucide-react';
import { User as UserType } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { UserMenu } from "../navigation/UserMenu";
import { NotificationBadge } from "../ui/NotificationBadge";

interface MobileHeaderProps {
  currentUser: UserType;
  currentTheme: ThemeConfig;
  categoryTitle: string;
  isDark: boolean;
  isBookstoreActive: boolean;
  pendingFriendRequestsCount: number;
  onAddDialogOpen: () => void;
  onToggleDark: () => void;
  onToggleBookstore: () => void;
  onFriendsDialogOpen: () => void;
  onSettingsDialogOpen: () => void;
  onProfileDialogOpen: () => void;
  onLogout: () => void;
}

export function MobileHeader({
  currentUser,
  currentTheme,
  categoryTitle,
  isDark,
  isBookstoreActive,
  pendingFriendRequestsCount,
  onAddDialogOpen,
  onToggleDark,
  onToggleBookstore,
  onFriendsDialogOpen,
  onSettingsDialogOpen,
  onProfileDialogOpen,
  onLogout,
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
        <h1 className="text-page-fg text-lg font-semibold absolute left-1/2 -translate-x-1/2">
          {categoryTitle}
        </h1>

        {/* Right: avatar that opens the shared UserMenu. Long-press
            (or two-finger tap) → profile dialog directly. We don't
            wire long-press here yet — primary action is the menu since
            that's where Friends / Settings / Log Out live. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-page-on-accent text-sm font-medium shadow overflow-hidden"
              style={{
                background: `linear-gradient(to bottom right, ${currentTheme.accentColor}, ${colorToRgba(currentTheme.accentColor, 0.8)})`,
              }}
            >
              {currentUser.profileImage && (
                <img
                  src={currentUser.profileImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              {!currentUser.profileImage && currentUser.name.charAt(0)}
              <NotificationBadge count={pendingFriendRequestsCount} variant="floating" dot />
            </button>
          </DropdownMenuTrigger>
          <UserMenu
            isDark={isDark}
            isBookstoreActive={isBookstoreActive}
            pendingFriendRequestsCount={pendingFriendRequestsCount}
            onToggleDark={onToggleDark}
            onToggleBookstore={onToggleBookstore}
            onFriendsDialogOpen={onFriendsDialogOpen}
            onSettingsDialogOpen={onSettingsDialogOpen}
            onLogout={onLogout}
          />
        </DropdownMenu>

        {/* Profile dialog opener — keep the "tap your face to see your
            profile" path available via a small tap-target above the
            avatar. (Or merge this into the dropdown as another item
            later if it feels redundant.) */}
        <button
          type="button"
          onClick={onProfileDialogOpen}
          className="sr-only"
          aria-label="Open profile"
        >
          Profile
        </button>
      </div>
    </header>
  );
}
