/**
 * MainContent – scrollable content area to the right of the sidebar.
 * Displays the category heading, section subtitle, view-mode toggle
 * (grid/list), and the collection items. Renders either a responsive
 * MovieCard grid, a sortable ListView table, or an empty-state prompt.
 */

import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Plus, LayoutGrid, List, Share2 } from 'lucide-react';
import { Movie, CustomTab, CustomSection } from "../types";
import { MovieCard } from "./MovieCard";
import { ListView } from "./ListView";
import { ThemeConfig, colorToRgba } from "../utils/themeConfig";
import { getSectionDisplayName, getContentTypeName, getCategoryDisplayName } from "../utils/contentHelpers";

interface MainContentProps {
  movies: Movie[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
  contentType: string;
  activeSection: string;
  viewMode: 'grid' | 'list';
  currentTheme: ThemeConfig;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onAddDialogOpen: () => void;
  onAddSectionDialogOpen: () => void;
  onShareDialogOpen: () => void;
  onMovieUpdate: (id: string, updates: Partial<Movie>) => void;
  onMovieDelete: (id: string) => void;
  onMovieClick: (movie: Movie) => void;
  getSectionContent: (sectionId: string) => Movie[];
}

export function MainContent({
  customTabs,
  customSections,
  contentType,
  activeSection,
  viewMode,
  currentTheme,
  onViewModeChange,
  onAddDialogOpen,
  onAddSectionDialogOpen,
  onShareDialogOpen,
  onMovieUpdate,
  onMovieDelete,
  onMovieClick,
  getSectionContent,
}: MainContentProps) {
  const itemsInActiveSection = getSectionContent(activeSection);

  const activeSectionDescriptionText = getSectionDisplayName(activeSection, contentType, customSections, customTabs);
  const currentCategoryHeadingTitle = getCategoryDisplayName(contentType, customTabs);
  const singularTypeName = getContentTypeName(contentType, false, customTabs);
  const pluralTypeName = getContentTypeName(contentType, true, customTabs);
  const addButtonLabel = singularTypeName.charAt(0).toUpperCase() + singularTypeName.slice(1);

  let emptyStateMessageText: string;
  if (activeSection === 'all') {
    emptyStateMessageText = `No ${pluralTypeName} yet. Add your first ${singularTypeName} to get started!`;
  } else {
    emptyStateMessageText = `No ${pluralTypeName} in this section yet.`;
  }

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

  let mainContentAreaDisplay;
  if (itemsInActiveSection.length === 0) {
    mainContentAreaDisplay = (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">{emptyStateMessageText}</p>
        {activeSection === 'all' && (
          <Button
            onClick={onAddDialogOpen}
            style={{ backgroundColor: currentTheme.accentColor }}
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
    <div className="flex-1 ml-72 p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-white mb-2">{currentCategoryHeadingTitle}</h1>
              <p className="text-gray-400">{activeSectionDescriptionText}</p>
            </div>
            {itemsInActiveSection.length > 0 && (
              <Button
                onClick={onShareDialogOpen}
                variant="ghost"
                size="sm"
                style={{ color: colorToRgba(currentTheme.accentColor, 0.7) }}
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
            <ToggleGroup type="single" value={viewMode} onValueChange={(newValue) => {
              if (newValue) {
                onViewModeChange(newValue as 'grid' | 'list');
              }
            }}>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                style={{ backgroundColor: listViewButtonBackgroundColor, color: listViewButtonTextColor }}
              >
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                style={{ backgroundColor: gridViewButtonBackgroundColor, color: gridViewButtonTextColor }}
              >
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Button
              onClick={onAddDialogOpen}
              style={{ backgroundColor: currentTheme.accentColor }}
              className="text-white hover:opacity-90"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add {addButtonLabel}
            </Button>

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

      {mainContentAreaDisplay}
    </div>
  );
}
