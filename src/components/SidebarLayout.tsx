import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Plus, LayoutGrid, List, Film, Tv, UtensilsCrossed, MapPin, User, Settings, LogOut, Users, Star, Share2 } from 'lucide-react';
import { Movie } from "../types/movie";
import { CustomTab } from "../types/customTab";
import { CustomSection } from "../types/customSection";
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
  const currentContent = movies.filter(m => m.type === contentType);
  const watchedMovies = currentContent.filter(m => m.status === 'watched');
  const wantToSeeMovies = currentContent.filter(m => m.status === 'want-to-see');
  const favoriteMovies = currentContent.filter(m => m.favorite);
  const currentSections = customSections.filter(s => s.contentType === contentType);
  const activeSectionContent = getSectionContent(activeSection);

  const renderSubCategories = (type: string) => {
    return (
      <div className="mt-2 ml-6 space-y-1">
        <button
          onClick={() => onActiveSectionChange('all')}
          style={{
            backgroundColor: activeSection === 'all' && contentType === type ? colorToRgba(currentTheme.accentColor, 0.2) : 'transparent',
            color: activeSection === 'all' && contentType === type ? currentTheme.accentColor : 'rgba(255, 255, 255, 0.9)',
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
            activeSection === 'all' && contentType === type
              ? 'font-medium'
              : 'hover:text-white hover:bg-slate-700/50'
          }`}
        >
          All ({currentContent.length})
        </button>
        <button
          onClick={() => onActiveSectionChange('watched')}
          style={{
            backgroundColor: activeSection === 'watched' && contentType === type ? colorToRgba(currentTheme.accentColor, 0.2) : 'transparent',
            color: activeSection === 'watched' && contentType === type ? currentTheme.accentColor : 'rgba(255, 255, 255, 0.9)',
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
            activeSection === 'watched' && contentType === type
              ? 'font-medium'
              : 'hover:text-white hover:bg-slate-700/50'
          }`}
        >
          {(type === 'movie' || type === 'tv-show') ? 'Watched' : 'Visited'} ({watchedMovies.length})
        </button>
        <button
          onClick={() => onActiveSectionChange('want-to-see')}
          style={{
            backgroundColor: activeSection === 'want-to-see' && contentType === type ? colorToRgba(currentTheme.accentColor, 0.2) : 'transparent',
            color: activeSection === 'want-to-see' && contentType === type ? currentTheme.accentColor : 'rgba(255, 255, 255, 0.9)',
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
            activeSection === 'want-to-see' && contentType === type
              ? 'font-medium'
              : 'hover:text-white hover:bg-slate-700/50'
          }`}
        >
          {(type === 'movie' || type === 'tv-show') ? 'Want to See' : 'Want to Visit'} ({wantToSeeMovies.length})
        </button>
        <button
          onClick={() => onActiveSectionChange('favorites')}
          style={{
            backgroundColor: activeSection === 'favorites' && contentType === type ? colorToRgba(currentTheme.accentColor, 0.2) : 'transparent',
            color: activeSection === 'favorites' && contentType === type ? currentTheme.accentColor : 'rgba(255, 255, 255, 0.9)',
          }}
          className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
            activeSection === 'favorites' && contentType === type
              ? 'font-medium'
              : 'hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Favorites ({favoriteMovies.length})
        </button>
        
        {/* Divider if there are custom sections */}
        {currentSections.length > 0 && (
          <div className="py-1">
            <div className="border-t border-slate-600/50"></div>
          </div>
        )}
        
        {currentSections.map(section => {
          const count = currentContent.filter(m => m.sections?.includes(section.id)).length;
          return (
            <button
              key={section.id}
              onClick={() => onActiveSectionChange(section.id)}
              style={{
                backgroundColor: activeSection === section.id && contentType === type ? colorToRgba(currentTheme.accentColor, 0.2) : 'transparent',
                color: activeSection === section.id && contentType === type ? currentTheme.accentColor : 'rgba(255, 255, 255, 0.9)',
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                activeSection === section.id && contentType === type
                  ? 'font-medium'
                  : 'hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {section.name} ({count})
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
          onMouseEnter={(e) => e.currentTarget.style.color = currentTheme.accentColor}
          onMouseLeave={(e) => e.currentTarget.style.color = colorToRgba(currentTheme.accentColor, 0.6)}
        >
          <Plus className="h-3 w-3" />
          Add Subcategory
        </button>
      </div>
    );
  };

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Sidebar */}
      <div 
        className="w-72 backdrop-blur-sm border-r p-6 overflow-y-auto fixed h-screen"
        style={{
          background: currentTheme.sidebarGradient,
          borderRightColor: `${currentTheme.accentColor}30`, // 30 is hex for ~19% opacity
        }}
      >
        {/* User Profile Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{
                background: `linear-gradient(to bottom right, ${currentTheme.accentColor}, ${currentTheme.accentColor}cc)` // cc is 80% opacity
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
                background: `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0)}  0%, ${colorToRgba(currentTheme.accentColor, 0)} 100%)`,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0.2)}, ${colorToRgba(currentTheme.accentColor, 0.1)})`;
                e.currentTarget.style.color = currentTheme.accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(to right, ${colorToRgba(currentTheme.accentColor, 0.2)}, ${colorToRgba(currentTheme.accentColor, 0.1)})`;
                e.currentTarget.style.color = currentTheme.accentColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'white';
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
                onExpandedCategoryChange(expandedCategory === 'movie' ? '' : 'movie');
              }}
              style={{
                backgroundColor: contentType === 'movie' ? currentTheme.accentColor : 'rgba(51, 65, 85, 0.5)',
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                contentType === 'movie'
                  ? 'text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
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
                onExpandedCategoryChange(expandedCategory === 'tv-show' ? '' : 'tv-show');
              }}
              style={{
                backgroundColor: contentType === 'tv-show' ? currentTheme.accentColor : 'rgba(51, 65, 85, 0.5)',
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                contentType === 'tv-show'
                  ? 'text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
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
                onExpandedCategoryChange(expandedCategory === 'restaurant' ? '' : 'restaurant');
              }}
              style={{
                backgroundColor: contentType === 'restaurant' ? currentTheme.accentColor : 'rgba(51, 65, 85, 0.5)',
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                contentType === 'restaurant'
                  ? 'text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
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
                onExpandedCategoryChange(expandedCategory === 'place' ? '' : 'place');
              }}
              style={{
                backgroundColor: contentType === 'place' ? currentTheme.accentColor : 'rgba(51, 65, 85, 0.5)',
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                contentType === 'place'
                  ? 'text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
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
          {customTabs.map(tab => {
            const Icon = Star;
            const count = movies.filter(m => m.type === tab.id).length;
            return (
              <ContextMenu key={tab.id}>
                <ContextMenuTrigger asChild>
                  <div>
                    <button
                      onClick={() => {
                        onContentTypeChange(tab.id);
                        onExpandedCategoryChange(expandedCategory === tab.id ? '' : tab.id);
                      }}
                      style={{
                        backgroundColor: contentType === tab.id ? currentTheme.accentColor : 'rgba(51, 65, 85, 0.5)',
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        contentType === tab.id
                          ? 'text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                      </div>
                      <span className="text-sm">{count}</span>
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
                  {customTabs.find(t => t.id === contentType)?.name || 'My Collection'}
                </h1>
                <p className="text-gray-400">
                  {activeSection === 'all' && `All ${getContentTypeName(contentType)}`}
                  {activeSection === 'watched' && (contentType === 'movie' || contentType === 'tv-show' ? 'Watched' : 'Visited')}
                  {activeSection === 'want-to-see' && (contentType === 'movie' || contentType === 'tv-show' ? 'Want to See' : 'Want to Visit')}
                  {activeSection === 'favorites' && 'Favorites'}
                  {currentSections.find(s => s.id === activeSection)?.name || ''}
                </p>
              </div>
              {/* Share Button */}
              {activeSectionContent.length > 0 && (
                <Button
                  onClick={onShareDialogOpen}
                  variant="ghost"
                  size="sm"
                  style={{
                    color: colorToRgba(currentTheme.accentColor, 0.7),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = currentTheme.accentColor;
                    e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colorToRgba(currentTheme.accentColor, 0.7);
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as 'grid' | 'list')}>
                <ToggleGroupItem 
                  value="list" 
                  aria-label="List view" 
                  className="bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                  style={{
                    backgroundColor: viewMode === 'list' ? currentTheme.accentColor : undefined,
                    color: viewMode === 'list' ? 'white' : undefined,
                  }}
                >
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="grid" 
                  aria-label="Grid view" 
                  className="bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                  style={{
                    backgroundColor: viewMode === 'grid' ? currentTheme.accentColor : undefined,
                    color: viewMode === 'grid' ? 'white' : undefined,
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
                Add {getContentTypeName(contentType, false).charAt(0).toUpperCase() + getContentTypeName(contentType, false).slice(1)}
              </Button>

              {/* Add Section Button */}
              <Button
                onClick={onAddSectionDialogOpen}
                variant="outline"
                style={{
                  borderColor: colorToRgba(currentTheme.accentColor, 0.5),
                  color: currentTheme.accentColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colorToRgba(currentTheme.accentColor, 0.2);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeSectionContent.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">
              {activeSection === 'all'
                ? `No ${getContentTypeName(contentType)} yet. Add your first ${getContentTypeName(contentType, false)} to get started!`
                : `No ${getContentTypeName(contentType)} in this section yet.`
              }
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
                Add {getContentTypeName(contentType, false).charAt(0).toUpperCase() + getContentTypeName(contentType, false).slice(1)}
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeSectionContent.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onUpdate={onMovieUpdate}
                onDelete={onMovieDelete}
              />
            ))}
          </div>
        ) : (
          <ListView
            movies={activeSectionContent}
            onUpdate={onMovieUpdate}
            onDelete={onMovieDelete}
            onMovieClick={onMovieClick}
            isDarkMode={true}
          />
        )}
      </div>
    </div>
  );
}