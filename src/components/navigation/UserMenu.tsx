/**
 * UserMenu – the gear / avatar dropdown menu. Same content surface on
 * desktop (Sidebar gear icon) and mobile (MobileHeader avatar) so the
 * user can reach Friends / Settings / theme toggles / log-out from
 * either chrome without duplicating the menu items.
 *
 * Per coding-standards §1: the gear menu used to live inline in
 * Sidebar.tsx; once mobile needed the same actions it became the
 * second occurrence of the same shape — extracted here.
 *
 * Layout: just the <DropdownMenuContent> + items. The caller provides
 * the <DropdownMenu> + <DropdownMenuTrigger> so each surface can use
 * its own trigger element (gear button vs avatar circle).
 */

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Sun,
  Moon,
  BookOpen,
  Users,
  SlidersHorizontal,
  LogOut,
  UserCircle,
} from "lucide-react";
import { NotificationBadge } from "../ui/NotificationBadge";
import { SURFACE_BACKGROUND } from "../../utils/surfaceBackgrounds";

interface UserMenuProps {
  isDark: boolean;
  isCoffeeActive: boolean;
  pendingFriendRequestsCount: number;
  onToggleDark: () => void;
  onToggleCoffee: () => void;
  onFriendsDialogOpen: () => void;
  onSettingsDialogOpen: () => void;
  onLogout: () => void;
  /** Optional Profile-dialog opener — when supplied, a "Profile" item
   *  appears at the top of the menu. Sidebar omits it (the avatar
   *  circle next to the gear already opens the profile); mobile uses
   *  it since the avatar IS the menu trigger. */
  onProfileDialogOpen?: () => void;
  /** Where the menu pops out relative to its trigger. Sidebar gear uses
   *  "end" (right-aligned); MobileHeader avatar is on the right of the
   *  bar so also wants "end". Exposed as a prop in case a future
   *  surface needs a different anchor. */
  align?: "start" | "center" | "end";
}

export function UserMenu({
  isDark,
  isCoffeeActive,
  pendingFriendRequestsCount,
  onToggleDark,
  onToggleCoffee,
  onFriendsDialogOpen,
  onSettingsDialogOpen,
  onLogout,
  onProfileDialogOpen,
  align = "end",
}: UserMenuProps) {
  return (
    <DropdownMenuContent
      align={align}
      className="text-white border-white/10 [&_[data-slot=dropdown-menu-item]]:focus:bg-white/10 [&_[data-slot=dropdown-menu-item]]:focus:text-white"
      style={{ background: SURFACE_BACKGROUND }}
    >
      {onProfileDialogOpen && (
        <DropdownMenuItem onClick={onProfileDialogOpen}>
          <UserCircle className="h-4 w-4 mr-2 text-page-fg" />
          Profile
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={onToggleDark}>
        {isDark ? (
          <Sun className="h-4 w-4 mr-2 text-yellow-400" />
        ) : (
          <Moon className="h-4 w-4 mr-2 text-blue-300" />
        )}
        {isDark ? "Light Mode" : "Dark Mode"}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onToggleCoffee}>
        <BookOpen className="h-4 w-4 mr-2 text-amber-400" />
        {isCoffeeActive ? "Default Theme" : "Coffee Theme"}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onFriendsDialogOpen}>
        <Users className="h-4 w-4 mr-2 text-green-400" />
        <span>Friends</span>
        <NotificationBadge count={pendingFriendRequestsCount} dot className="ml-auto" />
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onSettingsDialogOpen}>
        <SlidersHorizontal className="h-4 w-4 mr-2 text-cyan-400" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-white/10" />
      <DropdownMenuItem onClick={onLogout}>
        <LogOut className="h-4 w-4 mr-2 text-red-400" />
        Log Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
