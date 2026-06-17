/**
 * Sidebar – fixed left navigation panel.
 * Renders the user profile section, built-in category buttons
 * (Movies, TV Shows, Restaurants, Places), user-created custom tabs,
 * and bottom actions (Switch Profile, Log Out). Each category can be
 * expanded to show its SubCategoryNav.
 */

import { Button } from "../ui/button";
import { Plus, Settings, Star, User } from 'lucide-react';
import { BUILT_IN_CATEGORIES } from "../../utils/builtInCategories";
import { UserMenu } from "./UserMenu";
import { useTheme } from "next-themes";
import { Item, CustomTab, CustomSection } from "../../types";
import type { User as UserType } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { accentGradientHoverHandlers } from "../../utils/accentHover";
import { CategoryButton } from "./CategoryButton";
import { SubCategoryNav } from "./SubCategoryNav";
import { NotificationBadge } from "../ui/NotificationBadge";
import { SURFACE_BACKGROUND } from "../../utils/surfaceBackgrounds";
import { NAV_HOVER_CLASS } from "../../utils/hoverStyles";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface SidebarProps {
  currentUser: UserType;
  items: Item[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
  contentType: string;
  activeSection: string;
  expandedCategory: string;
  movieCount: number;
  tvShowCount: number;
  restaurantCount: number;
  placeCount: number;
  gameCount: number;
  /** Per-user visibility map keyed by content-type id. Missing entries
   *  are treated as visible (defensive default for new categories). */
  visibleCategories: Record<string, boolean>;
  currentTheme: ThemeConfig;
  /** Whether the app-wide Coffee light theme is currently active. */
  isCoffeeActive: boolean;
  /** Toggle the Coffee theme on/off from the profile dropdown. */
  onToggleCoffee: () => void;
  onContentTypeChange: (type: string) => void;
  onActiveSectionChange: (section: string) => void;
  onExpandedCategoryChange: (category: string) => void;
  onAddSectionDialogOpen: () => void;
  onAddTabDialogOpen: () => void;
  onProfileDialogOpen: () => void;
  onSettingsDialogOpen: () => void;
  onFriendsDialogOpen: () => void;
  onLogout: () => void;
  onTabDelete: (tab: CustomTab) => void;
  pendingFriendRequestsCount: number;
  /** Whether the slide-out is open at narrow widths. Ignored at lg+ (sidebar always visible). */
  isOpen?: boolean;
  /** Called when the user picks an action that should auto-close the slide-out (narrow widths only). */
  onClose?: () => void;
}

export function Sidebar({
  currentUser,
  items,
  customTabs,
  customSections,
  contentType,
  activeSection,
  expandedCategory,
  movieCount,
  tvShowCount,
  restaurantCount,
  placeCount,
  gameCount,
  visibleCategories,
  currentTheme,
  isCoffeeActive,
  onToggleCoffee,
  onContentTypeChange,
  onActiveSectionChange,
  onExpandedCategoryChange,
  onAddSectionDialogOpen,
  onAddTabDialogOpen,
  onProfileDialogOpen,
  onSettingsDialogOpen,
  onFriendsDialogOpen,
  onLogout,
  onTabDelete,
  pendingFriendRequestsCount,
  isOpen = true,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  // Filter items for the currently selected category to get sub-section counts
  const allItemsInCurrentCategory = items.filter((collectionItem) => collectionItem.type === contentType);
  const watchedItems = allItemsInCurrentCategory.filter((collectionItem) => collectionItem.status === 'watched');
  const wantToSeeItems = allItemsInCurrentCategory.filter((collectionItem) => collectionItem.status === 'want-to-see');
  const favoriteItems = allItemsInCurrentCategory.filter((collectionItem) => collectionItem.favorite);

  // Clicking a category selects it and toggles its sub-nav expansion
  const handleCategoryClick = (categoryId: string) => {
    onContentTypeChange(categoryId);
    let newExpandedCategory: string;
    if (expandedCategory === categoryId) {
      newExpandedCategory = '';
    } else {
      newExpandedCategory = categoryId;
    }
    onExpandedCategoryChange(newExpandedCategory);
  };

  const subCategoryNavProps = {
    contentType,
    activeSection,
    currentTheme,
    allItems: allItemsInCurrentCategory,
    watchedItems,
    wantToSeeItems,
    favoriteItems,
    customSections,
    onActiveSectionChange,
    onAddSectionDialogOpen,
  };

  // Count lookup keyed by content-type id. Read from the existing named
  // count props rather than threading a Record through every chain
  // (the count props pre-date this refactor and are still useful at
  // their existing callsites). Adding a new built-in category here
  // requires also extending useCollectionStats's named output.
  const countById: Record<string, number> = {
    item: movieCount,
    'tv-show': tvShowCount,
    restaurant: restaurantCount,
    place: placeCount,
    game: gameCount,
  };

  // Hide categories the user has explicitly toggled off in Settings.
  // Missing entries in visibleCategories are treated as visible. The
  // `?? {}` guards against a stale prefs blob whose visibleCategories
  // key was never written (see usePreferences for the same defensive
  // merge at the source).
  const visibleMap = visibleCategories ?? {};
  const visibleBuiltInCategories = BUILT_IN_CATEGORIES.filter((category) => {
    if (visibleMap[category.id] === false) return false;
    return true;
  });

  // Slide-out behaviour for narrow screens. The .sidebar-fluid CSS rule
  // (in index.css) reads data-open to translate the panel in/out below
  // 1024px and forces it always-visible at 1024px+ via a media query.
  return (
    <div
      data-open={isOpen}
      className="sidebar-fluid backdrop-blur-sm border-r p-6 overflow-y-auto fixed h-screen z-40"
      style={{
        // Coffee is a light surface that must win even when next-themes is
        // dark, so it takes precedence over the isDark dark-sidebar branch.
        background: isCoffeeActive
          ? currentTheme.sidebarGradient
          : (isDark ? 'var(--sidebar)' : currentTheme.sidebarGradient),
        borderRightColor: isCoffeeActive
          ? 'var(--page-divider)'
          : (isDark ? 'var(--sidebar-border)' : colorToRgba(currentTheme.accentColor, 0.19)),
      }}
    >
      {/* User Profile Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onProfileDialogOpen}
            aria-label="Open profile"
            title="Open profile"
            className="w-10 h-10 rounded-full flex items-center justify-center text-page-on-accent shadow-lg cursor-pointer transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 overflow-hidden"
            style={{
              background: `linear-gradient(to bottom right, ${currentTheme.accentColor}, ${colorToRgba(currentTheme.accentColor, 0.8)})`,
              outlineColor: currentTheme.accentColor,
            }}
          >
            {currentUser.profileImage && (
              <img
                src={currentUser.profileImage}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            {!currentUser.profileImage && <User className="h-5 w-5" />}
          </button>
          <button
            onClick={onProfileDialogOpen}
            className="flex-1 text-left cursor-pointer"
          >
            <div className="text-page-fg text-sm font-medium">{currentUser.name}</div>
            <div className="text-page-signin text-xs">Signed in</div>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative inline-flex">
                <Button
                  variant="ghost"
                  size="sm"
                  style={{
                    background: `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0)} 0%, ${colorToRgba(currentTheme.accentColor, 0)} 100%)`,
                    color: 'var(--page-fg)',
                  }}
                  {...accentGradientHoverHandlers(currentTheme)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <NotificationBadge count={pendingFriendRequestsCount} variant="floating" dot />
              </div>
            </DropdownMenuTrigger>
            <UserMenu
              isDark={isDark}
              isCoffeeActive={isCoffeeActive}
              pendingFriendRequestsCount={pendingFriendRequestsCount}
              onToggleDark={() => setTheme(isDark ? "light" : "dark")}
              onToggleCoffee={onToggleCoffee}
              onFriendsDialogOpen={onFriendsDialogOpen}
              onSettingsDialogOpen={onSettingsDialogOpen}
              onLogout={onLogout}
            />
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Categories */}
      <div className="space-y-2">
        <div style={{ color: colorToRgba(currentTheme.accentColor, 0.7) }} className="text-xs uppercase tracking-wider mb-3">Categories</div>

        {visibleBuiltInCategories.map((category) => (
          <div key={category.id}>
            <CategoryButton
              label={category.label}
              count={countById[category.id] ?? 0}
              icon={category.icon}
              isActive={contentType === category.id}
              currentTheme={currentTheme}
              onClick={() => handleCategoryClick(category.id)}
            />
            {expandedCategory === category.id && (
              <SubCategoryNav categoryType={category.id} {...subCategoryNavProps} />
            )}
          </div>
        ))}

        {/* Custom Tabs */}
        {customTabs.map((tab) => {
          const numberOfItemsInTab = items.filter((collectionItem) => collectionItem.type === tab.id).length;
          return (
            <ContextMenu key={tab.id}>
              <ContextMenuTrigger asChild>
                <div>
                  <CategoryButton
                    label={tab.name}
                    count={numberOfItemsInTab}
                    icon={Star}
                    isActive={contentType === tab.id}
                    currentTheme={currentTheme}
                    onClick={() => handleCategoryClick(tab.id)}
                  />
                  {expandedCategory === tab.id && (
                    <SubCategoryNav categoryType={tab.id} {...subCategoryNavProps} />
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onTabDelete(tab)}
                >
                  Delete Tab
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}

        {/* Add Category — adds a custom top-level tab. The dialog awaits
            the insert; on failure (RLS, network) the dialog stays open
            and surfaces the toast (see commit history for todo J). */}
        <Button
          onClick={onAddTabDialogOpen}
          variant="ghost"
          className={`w-full justify-start text-page-fg-muted hover:text-page-fg ${NAV_HOVER_CLASS}`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

    </div>
  );
}
