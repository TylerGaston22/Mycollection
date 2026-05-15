/**
 * Sidebar – fixed left navigation panel.
 * Renders the user profile section, built-in category buttons
 * (Movies, TV Shows, Restaurants, Places), user-created custom tabs,
 * and bottom actions (Switch Profile, Log Out). Each category can be
 * expanded to show its SubCategoryNav.
 */

import { Button } from "../ui/button";
import { Plus, Film, Tv, UtensilsCrossed, MapPin, Settings, LogOut, Star, Moon, Sun, SlidersHorizontal } from 'lucide-react';
import { useTheme } from "next-themes";
import { Item, CustomTab, CustomSection } from "../../types";
import type { User as UserType } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { CategoryButton } from "./CategoryButton";
import { SubCategoryNav } from "./SubCategoryNav";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  currentTheme: ThemeConfig;
  onContentTypeChange: (type: string) => void;
  onActiveSectionChange: (section: string) => void;
  onExpandedCategoryChange: (category: string) => void;
  onAddSectionDialogOpen: () => void;
  onAddTabDialogOpen: () => void;
  onProfileDialogOpen: () => void;
  onSettingsDialogOpen: () => void;
  onLogout: () => void;
  onTabDelete: (tab: CustomTab) => void;
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
  currentTheme,
  onContentTypeChange,
  onActiveSectionChange,
  onExpandedCategoryChange,
  onAddSectionDialogOpen,
  onAddTabDialogOpen,
  onProfileDialogOpen,
  onSettingsDialogOpen,
  onLogout,
  onTabDelete,
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

  const builtInCategories = [
    { id: 'item', label: 'Movies', count: movieCount, icon: Film },
    { id: 'tv-show', label: 'TV Shows', count: tvShowCount, icon: Tv },
    { id: 'restaurant', label: 'Restaurants', count: restaurantCount, icon: UtensilsCrossed },
    { id: 'place', label: 'Places', count: placeCount, icon: MapPin },
  ];

  return (
    <div
      className="w-72 backdrop-blur-sm border-r p-6 overflow-y-auto fixed h-screen"
      style={{
        background: isDark ? 'var(--sidebar)' : currentTheme.sidebarGradient,
        borderRightColor: isDark ? 'var(--sidebar-border)' : `${currentTheme.accentColor}30`,
      }}
    >
      {/* User Profile Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onProfileDialogOpen}
            aria-label="Open profile"
            title="Open profile"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: `linear-gradient(to bottom right, ${currentTheme.accentColor}, ${currentTheme.accentColor}cc)`,
              outlineColor: currentTheme.accentColor,
            }}
          >
            {currentUser.name.charAt(0)}
          </button>
          <button
            onClick={onProfileDialogOpen}
            className="flex-1 text-left cursor-pointer"
          >
            <div className="text-white text-sm font-medium">{currentUser.name}</div>
            <div className="text-purple-300 text-xs">Signed in</div>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                style={{
                  background: `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0)} 0%, ${colorToRgba(currentTheme.accentColor, 0)} 100%)`,
                  color: 'white',
                }}
                onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.currentTarget.style.background = `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0.2)}, ${colorToRgba(currentTheme.accentColor, 0.1)})`;
                  event.currentTarget.style.color = currentTheme.accentColor;
                }}
                onMouseLeave={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.currentTarget.style.background = 'transparent';
                  event.currentTarget.style.color = 'white';
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSettingsDialogOpen}>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Categories */}
      <div className="space-y-2">
        <div style={{ color: colorToRgba(currentTheme.accentColor, 0.7) }} className="text-xs uppercase tracking-wider mb-3">Categories</div>

        {builtInCategories.map((category) => (
          <div key={category.id}>
            <CategoryButton
              label={category.label}
              count={category.count}
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

        {/* Add Tab Button */}
        <Button
          onClick={onAddTabDialogOpen}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-slate-700/50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

    </div>
  );
}
