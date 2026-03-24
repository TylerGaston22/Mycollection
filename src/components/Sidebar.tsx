import { Button } from "./ui/button";
import { Plus, Film, Tv, UtensilsCrossed, MapPin, User, Settings, LogOut, Users, Star } from 'lucide-react';
import { Movie, CustomTab, CustomSection } from "../types";
import { ThemeConfig, colorToRgba } from "../utils/themeConfig";
import { CategoryButton } from "./CategoryButton";
import { SubCategoryNav } from "./SubCategoryNav";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

interface SidebarProps {
  currentUser: any;
  movies: Movie[];
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
  onProfileSwitcherOpen: () => void;
  onLogout: () => void;
  onTabDelete: (tab: CustomTab) => void;
}

export function Sidebar({
  currentUser,
  movies,
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
  onProfileSwitcherOpen,
  onLogout,
  onTabDelete,
}: SidebarProps) {
  const allItemsInCurrentCategory = movies.filter((item) => item.type === contentType);
  const watchedItems = allItemsInCurrentCategory.filter((item) => item.status === 'watched');
  const wantToSeeItems = allItemsInCurrentCategory.filter((item) => item.status === 'want-to-see');
  const favoriteItems = allItemsInCurrentCategory.filter((item) => item.favorite);

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
    { id: 'movie', label: 'Movies', count: movieCount, icon: Film },
    { id: 'tv-show', label: 'TV Shows', count: tvShowCount, icon: Tv },
    { id: 'restaurant', label: 'Restaurants', count: restaurantCount, icon: UtensilsCrossed },
    { id: 'place', label: 'Places', count: placeCount, icon: MapPin },
  ];

  return (
    <div
      className="w-72 backdrop-blur-sm border-r p-6 overflow-y-auto fixed h-screen"
      style={{
        background: currentTheme.sidebarGradient,
        borderRightColor: `${currentTheme.accentColor}30`,
      }}
    >
      {/* User Profile Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
            style={{
              background: `linear-gradient(to bottom right, ${currentTheme.accentColor}, ${currentTheme.accentColor}cc)`
            }}
          >
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{currentUser.name}</div>
            <div className="text-purple-300 text-xs">Signed in</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onProfileDialogOpen}
            variant="ghost"
            size="sm"
            style={{
              background: `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0)} 0%, ${colorToRgba(currentTheme.accentColor, 0)} 100%)`,
              color: 'white',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0.2)}, ${colorToRgba(currentTheme.accentColor, 0.1)})`;
              event.currentTarget.style.color = currentTheme.accentColor;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = 'transparent';
              event.currentTarget.style.color = 'white';
            }}
            className="flex-1"
          >
            <User className="h-4 w-4 mr-1" />
            Profile
          </Button>
          <Button
            onClick={onSettingsDialogOpen}
            variant="ghost"
            size="sm"
            style={{
              background: `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0)} 0%, ${colorToRgba(currentTheme.accentColor, 0)} 100%)`,
              color: 'white',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0.2)}, ${colorToRgba(currentTheme.accentColor, 0.1)})`;
              event.currentTarget.style.color = currentTheme.accentColor;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = 'transparent';
              event.currentTarget.style.color = 'white';
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
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
          const numberOfItemsInTab = movies.filter((item) => item.type === tab.id).length;
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

      {/* Bottom Actions */}
      <div className="mt-8 pt-6 border-t border-slate-700">
        <Button
          onClick={onProfileSwitcherOpen}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-slate-700/50 mb-2"
        >
          <Users className="h-4 w-4 mr-2" />
          Switch Profile
        </Button>
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
