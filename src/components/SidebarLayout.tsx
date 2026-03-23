import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Plus, LayoutGrid, List, Film, Tv, UtensilsCrossed, MapPin, User, Settings, LogOut, Users, Star, Share2 } from 'lucide-react';
import { Movie, CustomTab, CustomSection } from "../types";
import { MovieCard } from "./MovieCard";
import { ListView } from "./ListView";
import { ThemeConfig, colorToRgba } from "../utils/themeConfig";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";


interface SidebarLayoutProps {
  currentUser: any;
  movies: Movie[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
  contentType: string;
  activeSection: string;
  expandedCategory: string;
  viewMode: 'grid' | 'list';
  movieCount: number;
  tvShowCount: number;
  restaurantCount: number;
  placeCount: number;
  currentTheme: ThemeConfig;
  onContentTypeChange: (type: string) => void;
  onActiveSectionChange: (section: string) => void;
  onExpandedCategoryChange: (category: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddDialogOpen: () => void;
  onAddSectionDialogOpen: () => void;
  onAddTabDialogOpen: () => void;
  onProfileDialogOpen: () => void;
  onSettingsDialogOpen: () => void;
  onProfileSwitcherOpen: () => void;
  onLogout: () => void;
  onTabDelete: (tab: CustomTab) => void;
  onMovieUpdate: (id: string, updates: Partial<Movie>) => void;
  onMovieDelete: (id: string) => void;
  onMovieClick: (movie: Movie) => void;
  onShareDialogOpen: () => void;
  getContentTypeName: (type: string, plural?: boolean) => string;
  getSectionContent: (sectionId: string) => Movie[];
}

export function SidebarLayout({
  currentUser,
  movies,
  customTabs,
  customSections,
  contentType,
  activeSection,
  expandedCategory,
  viewMode,
  movieCount,
  tvShowCount,
  restaurantCount,
  placeCount,
  currentTheme,
  onContentTypeChange,
  onActiveSectionChange,
  onExpandedCategoryChange,
  onViewModeChange,
  onAddDialogOpen,
  onAddSectionDialogOpen,
  onAddTabDialogOpen,
  onProfileDialogOpen,
  onSettingsDialogOpen,
  onProfileSwitcherOpen,
  onLogout,
  onTabDelete,
  onMovieUpdate,
  onMovieDelete,
  onMovieClick,
  onShareDialogOpen,
  getContentTypeName,
  getSectionContent,
}: SidebarLayoutProps) {
  const allItemsInCurrentCategory = movies.filter((collectionItem) => collectionItem.type === contentType);
  const itemsWithWatchedStatus = allItemsInCurrentCategory.filter((collectionItem) => collectionItem.status === 'watched');
  const itemsWithWantToSeeStatus = allItemsInCurrentCategory.filter((collectionItem) => collectionItem.status === 'want-to-see');
  const itemsMarkedAsFavorite = allItemsInCurrentCategory.filter((collectionItem) => collectionItem.favorite);
  const customSectionsForCurrentCategory = customSections.filter((section) => section.contentType === contentType);
  const itemsInActiveSection = getSectionContent(activeSection);

  const renderSubCategories = (categoryType: string) => {
    const isMediaCategoryType = categoryType === 'movie' || categoryType === 'tv-show';

    let watchedSectionButtonText;
    if (isMediaCategoryType) {
      watchedSectionButtonText = 'Watched';
    } else {
      watchedSectionButtonText = 'Visited';
    }

    let wantToSeeSectionButtonText;
    if (isMediaCategoryType) {
      wantToSeeSectionButtonText = 'Want to See';
    } else {
      wantToSeeSectionButtonText = 'Want to Visit';
    }

    const isAllSectionActive = activeSection === 'all' && contentType === categoryType;
    let allButtonBackgroundColor;
    let allButtonTextColor;
    let allButtonAdditionalClass;
    if (isAllSectionActive) {
      allButtonBackgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
      allButtonTextColor = currentTheme.accentColor;
      allButtonAdditionalClass = 'font-medium';
    } else {
      allButtonBackgroundColor = 'transparent';
      allButtonTextColor = 'rgba(255, 255, 255, 0.9)';
      allButtonAdditionalClass = 'hover:text-white hover:bg-slate-700/50';
    }

    const isWatchedSectionActive = activeSection === 'watched' && contentType === categoryType;
    let watchedButtonBackgroundColor;
    let watchedButtonTextColor;
    let watchedButtonAdditionalClass;
    if (isWatchedSectionActive) {
      watchedButtonBackgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
      watchedButtonTextColor = currentTheme.accentColor;
      watchedButtonAdditionalClass = 'font-medium';
    } else {
      watchedButtonBackgroundColor = 'transparent';
      watchedButtonTextColor = 'rgba(255, 255, 255, 0.9)';
      watchedButtonAdditionalClass = 'hover:text-white hover:bg-slate-700/50';
    }

    const isWantToSeeSectionActive = activeSection === 'want-to-see' && contentType === categoryType;
    let wantToSeeButtonBackgroundColor;
    let wantToSeeButtonTextColor;
    let wantToSeeButtonAdditionalClass;
    if (isWantToSeeSectionActive) {
      wantToSeeButtonBackgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
      wantToSeeButtonTextColor = currentTheme.accentColor;
      wantToSeeButtonAdditionalClass = 'font-medium';
    } else {
      wantToSeeButtonBackgroundColor = 'transparent';
      wantToSeeButtonTextColor = 'rgba(255, 255, 255, 0.9)';
      wantToSeeButtonAdditionalClass = 'hover:text-white hover:bg-slate-700/50';
    }

    const isFavoritesSectionActive = activeSection === 'favorites' && contentType === categoryType;
    let favoritesButtonBackgroundColor;
    let favoritesButtonTextColor;
    let favoritesButtonAdditionalClass;
    if (isFavoritesSectionActive) {
      favoritesButtonBackgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
      favoritesButtonTextColor = currentTheme.accentColor;
      favoritesButtonAdditionalClass = 'font-medium';
    } else {
      favoritesButtonBackgroundColor = 'transparent';
      favoritesButtonTextColor = 'rgba(255, 255, 255, 0.9)';
      favoritesButtonAdditionalClass = 'hover:text-white hover:bg-slate-700/50';
    }

    return (
      <div className="mt-2 ml-6 space-y-1">
        <button
          onClick={() => onActiveSectionChange('all')}
          style={{
            backgroundColor: allButtonBackgroundColor,
            color: allButtonTextColor,
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${allButtonAdditionalClass}`}
        >
          All ({allItemsInCurrentCategory.length})
        </button>
        <button
          onClick={() => onActiveSectionChange('watched')}
          style={{
            backgroundColor: watchedButtonBackgroundColor,
            color: watchedButtonTextColor,
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${watchedButtonAdditionalClass}`}
        >
          {watchedSectionButtonText} ({itemsWithWatchedStatus.length})
        </button>
        <button
          onClick={() => onActiveSectionChange('want-to-see')}
          style={{
            backgroundColor: wantToSeeButtonBackgroundColor,
            color: wantToSeeButtonTextColor,
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${wantToSeeButtonAdditionalClass}`}
        >
          {wantToSeeSectionButtonText} ({itemsWithWantToSeeStatus.length})
        </button>
        <button
          onClick={() => onActiveSectionChange('favorites')}
          style={{
            backgroundColor: favoritesButtonBackgroundColor,
            color: favoritesButtonTextColor,
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${favoritesButtonAdditionalClass}`}
        >
          Favorites ({itemsMarkedAsFavorite.length})
        </button>

        {/* Divider if there are custom sections */}
        {customSectionsForCurrentCategory.length > 0 && (
          <div className="py-1">
            <div className="border-t border-slate-600/50"></div>
          </div>
        )}

        {customSectionsForCurrentCategory.map((section) => {
          const numberOfItemsInSection = allItemsInCurrentCategory.filter((collectionItem) => collectionItem.sections?.includes(section.id)).length;
          const isSectionActive = activeSection === section.id && contentType === categoryType;

          let customSectionButtonBackgroundColor;
          let customSectionButtonTextColor;
          let customSectionButtonAdditionalClass;
          if (isSectionActive) {
            customSectionButtonBackgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
            customSectionButtonTextColor = currentTheme.accentColor;
            customSectionButtonAdditionalClass = 'font-medium';
          } else {
            customSectionButtonBackgroundColor = 'transparent';
            customSectionButtonTextColor = 'rgba(255, 255, 255, 0.9)';
            customSectionButtonAdditionalClass = 'hover:text-white hover:bg-slate-700/50';
          }

          return (
            <button
              key={section.id}
              onClick={() => onActiveSectionChange(section.id)}
              style={{
                backgroundColor: customSectionButtonBackgroundColor,
                color: customSectionButtonTextColor,
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${customSectionButtonAdditionalClass}`}
            >
              {section.name} ({numberOfItemsInSection})
            </button>
          );
        })}

        {/* Add Subcategory Button */}
        <button
          onClick={() => onAddSectionDialogOpen()}
          style={{
            color: colorToRgba(currentTheme.accentColor, 0.6),
          }}
          className="w-full text-left px-3 py-2 rounded text-sm transition-all hover:bg-slate-700/50 flex items-center gap-2"
          onMouseEnter={(event) => event.currentTarget.style.color = currentTheme.accentColor}
          onMouseLeave={(event) => event.currentTarget.style.color = colorToRgba(currentTheme.accentColor, 0.6)}
        >
          <Plus className="h-3 w-3" />
          Add Subcategory
        </button>
      </div>
    );
  };

  // Compute styles for each category button
  let moviesButtonBackgroundColor;
  let moviesButtonClassName;
  if (contentType === 'movie') {
    moviesButtonBackgroundColor = currentTheme.accentColor;
    moviesButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-white shadow-lg';
  } else {
    moviesButtonBackgroundColor = 'rgba(51, 65, 85, 0.5)';
    moviesButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-gray-300 hover:bg-slate-700';
  }

  let tvShowsButtonBackgroundColor;
  let tvShowsButtonClassName;
  if (contentType === 'tv-show') {
    tvShowsButtonBackgroundColor = currentTheme.accentColor;
    tvShowsButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-white shadow-lg';
  } else {
    tvShowsButtonBackgroundColor = 'rgba(51, 65, 85, 0.5)';
    tvShowsButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-gray-300 hover:bg-slate-700';
  }

  let restaurantsButtonBackgroundColor;
  let restaurantsButtonClassName;
  if (contentType === 'restaurant') {
    restaurantsButtonBackgroundColor = currentTheme.accentColor;
    restaurantsButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-white shadow-lg';
  } else {
    restaurantsButtonBackgroundColor = 'rgba(51, 65, 85, 0.5)';
    restaurantsButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-gray-300 hover:bg-slate-700';
  }

  let placesButtonBackgroundColor;
  let placesButtonClassName;
  if (contentType === 'place') {
    placesButtonBackgroundColor = currentTheme.accentColor;
    placesButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-white shadow-lg';
  } else {
    placesButtonBackgroundColor = 'rgba(51, 65, 85, 0.5)';
    placesButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-gray-300 hover:bg-slate-700';
  }

  // Compute view toggle button styles
  let listViewButtonBackgroundColor: string | undefined = undefined;
  let listViewButtonTextColor: string | undefined = undefined;
  if (viewMode === 'list') {
    listViewButtonBackgroundColor = currentTheme.accentColor;
    listViewButtonTextColor = 'white';
  }

  let gridViewButtonBackgroundColor: string | undefined = undefined;
  let gridViewButtonTextColor: string | undefined = undefined;
  if (viewMode === 'grid') {
    gridViewButtonBackgroundColor = currentTheme.accentColor;
    gridViewButtonTextColor = 'white';
  }

  // Compute active section description text
  const isMediaContentType = contentType === 'movie' || contentType === 'tv-show';
  let activeSectionDescriptionText = '';
  if (activeSection === 'all') {
    activeSectionDescriptionText = `All ${getContentTypeName(contentType)}`;
  } else if (activeSection === 'watched') {
    if (isMediaContentType) {
      activeSectionDescriptionText = 'Watched';
    } else {
      activeSectionDescriptionText = 'Visited';
    }
  } else if (activeSection === 'want-to-see') {
    if (isMediaContentType) {
      activeSectionDescriptionText = 'Want to See';
    } else {
      activeSectionDescriptionText = 'Want to Visit';
    }
  } else if (activeSection === 'favorites') {
    activeSectionDescriptionText = 'Favorites';
  } else {
    const matchingCustomSection = customSectionsForCurrentCategory.find((section) => section.id === activeSection);
    if (matchingCustomSection) {
      activeSectionDescriptionText = matchingCustomSection.name;
    }
  }

  // Compute heading title
  const matchingCustomTabForCurrentContentType = customTabs.find((customTab) => customTab.id === contentType);
  const currentCategoryHeadingTitle = matchingCustomTabForCurrentContentType?.name || 'My Collection';

  // Compute empty state message
  let emptyStateMessageText;
  if (activeSection === 'all') {
    emptyStateMessageText = `No ${getContentTypeName(contentType)} yet. Add your first ${getContentTypeName(contentType, false)} to get started!`;
  } else {
    emptyStateMessageText = `No ${getContentTypeName(contentType)} in this section yet.`;
  }

  // Compute the add button label (capitalize first letter)
  const addButtonSingularTypeName = getContentTypeName(contentType, false);
  const addButtonLabel = addButtonSingularTypeName.charAt(0).toUpperCase() + addButtonSingularTypeName.slice(1);

  // Compute main content area
  let mainContentAreaDisplay;
  if (itemsInActiveSection.length === 0) {
    mainContentAreaDisplay = (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">
          {emptyStateMessageText}
        </p>
        {activeSection === 'all' && (
          <Button
            onClick={onAddDialogOpen}
            style={{
              backgroundColor: currentTheme.accentColor,
            }}
            className="text-white hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {addButtonLabel}
          </Button>
        )}
      </div>
    );
  } else if (viewMode === 'grid') {
    mainContentAreaDisplay = (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {itemsInActiveSection.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onUpdate={onMovieUpdate}
            onDelete={onMovieDelete}
          />
        ))}
      </div>
    );
  } else {
    mainContentAreaDisplay = (
      <ListView
        movies={itemsInActiveSection}
        onUpdate={onMovieUpdate}
        onDelete={onMovieDelete}
        onMovieClick={onMovieClick}
        isDarkMode={true}
      />
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Sidebar */}
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

          {/* Movies */}
          <div>
            <button
              onClick={() => {
                onContentTypeChange('movie');
                let newExpandedCategory;
                if (expandedCategory === 'movie') {
                  newExpandedCategory = '';
                } else {
                  newExpandedCategory = 'movie';
                }
                onExpandedCategoryChange(newExpandedCategory);
              }}
              style={{ backgroundColor: moviesButtonBackgroundColor }}
              className={moviesButtonClassName}
            >
              <div className="flex items-center gap-3">
                <Film className="h-5 w-5" />
                <span>Movies</span>
              </div>
              <span className="text-sm">{movieCount}</span>
            </button>
            {expandedCategory === 'movie' && renderSubCategories('movie')}
          </div>

          {/* TV Shows */}
          <div>
            <button
              onClick={() => {
                onContentTypeChange('tv-show');
                let newExpandedCategory;
                if (expandedCategory === 'tv-show') {
                  newExpandedCategory = '';
                } else {
                  newExpandedCategory = 'tv-show';
                }
                onExpandedCategoryChange(newExpandedCategory);
              }}
              style={{ backgroundColor: tvShowsButtonBackgroundColor }}
              className={tvShowsButtonClassName}
            >
              <div className="flex items-center gap-3">
                <Tv className="h-5 w-5" />
                <span>TV Shows</span>
              </div>
              <span className="text-sm">{tvShowCount}</span>
            </button>
            {expandedCategory === 'tv-show' && renderSubCategories('tv-show')}
          </div>

          {/* Restaurants */}
          <div>
            <button
              onClick={() => {
                onContentTypeChange('restaurant');
                let newExpandedCategory;
                if (expandedCategory === 'restaurant') {
                  newExpandedCategory = '';
                } else {
                  newExpandedCategory = 'restaurant';
                }
                onExpandedCategoryChange(newExpandedCategory);
              }}
              style={{ backgroundColor: restaurantsButtonBackgroundColor }}
              className={restaurantsButtonClassName}
            >
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-5 w-5" />
                <span>Restaurants</span>
              </div>
              <span className="text-sm">{restaurantCount}</span>
            </button>
            {expandedCategory === 'restaurant' && renderSubCategories('restaurant')}
          </div>

          {/* Places */}
          <div>
            <button
              onClick={() => {
                onContentTypeChange('place');
                let newExpandedCategory;
                if (expandedCategory === 'place') {
                  newExpandedCategory = '';
                } else {
                  newExpandedCategory = 'place';
                }
                onExpandedCategoryChange(newExpandedCategory);
              }}
              style={{ backgroundColor: placesButtonBackgroundColor }}
              className={placesButtonClassName}
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <span>Places</span>
              </div>
              <span className="text-sm">{placeCount}</span>
            </button>
            {expandedCategory === 'place' && renderSubCategories('place')}
          </div>

          {/* Custom Tabs */}
          {customTabs.map((tab) => {
            const TabIcon = Star;
            const numberOfItemsInTab = movies.filter((collectionItem) => collectionItem.type === tab.id).length;

            let tabButtonBackgroundColor;
            let tabButtonClassName;
            if (contentType === tab.id) {
              tabButtonBackgroundColor = currentTheme.accentColor;
              tabButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-white shadow-lg';
            } else {
              tabButtonBackgroundColor = 'rgba(51, 65, 85, 0.5)';
              tabButtonClassName = 'w-full flex items-center justify-between p-3 rounded-lg transition-all text-gray-300 hover:bg-slate-700';
            }

            return (
              <ContextMenu key={tab.id}>
                <ContextMenuTrigger asChild>
                  <div>
                    <button
                      onClick={() => {
                        onContentTypeChange(tab.id);
                        let newExpandedCategory;
                        if (expandedCategory === tab.id) {
                          newExpandedCategory = '';
                        } else {
                          newExpandedCategory = tab.id;
                        }
                        onExpandedCategoryChange(newExpandedCategory);
                      }}
                      style={{ backgroundColor: tabButtonBackgroundColor }}
                      className={tabButtonClassName}
                    >
                      <div className="flex items-center gap-3">
                        <TabIcon className="h-5 w-5" />
                        <span>{tab.name}</span>
                      </div>
                      <span className="text-sm">{numberOfItemsInTab}</span>
                    </button>
                    {expandedCategory === tab.id && renderSubCategories(tab.id)}
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

      {/* Main Content Area */}
      <div className="flex-1 ml-72 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-white mb-2">
                  {contentType === 'movie' && 'Movies'}
                  {contentType === 'tv-show' && 'TV Shows'}
                  {contentType === 'restaurant' && 'Restaurants'}
                  {contentType === 'place' && 'Places'}
                  {currentCategoryHeadingTitle}
                </h1>
                <p className="text-gray-400">
                  {activeSectionDescriptionText}
                </p>
              </div>
              {/* Share Button */}
              {itemsInActiveSection.length > 0 && (
                <Button
                  onClick={onShareDialogOpen}
                  variant="ghost"
                  size="sm"
                  style={{
                    color: colorToRgba(currentTheme.accentColor, 0.7),
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.color = currentTheme.accentColor;
                    event.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.color = colorToRgba(currentTheme.accentColor, 0.7);
                    event.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <ToggleGroup type="single" value={viewMode} onValueChange={(newViewModeValue) => {
                if (newViewModeValue) {
                  onViewModeChange(newViewModeValue as 'grid' | 'list');
                }
              }}>
                <ToggleGroupItem
                  value="list"
                  aria-label="List view"
                  className="bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                  style={{
                    backgroundColor: listViewButtonBackgroundColor,
                    color: listViewButtonTextColor,
                  }}
                >
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                  style={{
                    backgroundColor: gridViewButtonBackgroundColor,
                    color: gridViewButtonTextColor,
                  }}
                >
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Add Button */}
              <Button
                onClick={onAddDialogOpen}
                style={{
                  backgroundColor: currentTheme.accentColor,
                }}
                className="text-white hover:opacity-90"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add {addButtonLabel}
              </Button>

              {/* Add Section Button */}
              <Button
                onClick={onAddSectionDialogOpen}
                variant="outline"
                style={{
                  borderColor: colorToRgba(currentTheme.accentColor, 0.5),
                  color: currentTheme.accentColor,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {mainContentAreaDisplay}
      </div>
    </div>
  );
}
