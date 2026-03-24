/**
 * SidebarLayout – top-level layout wrapper.
 * Composes the fixed Sidebar (navigation) and the scrollable MainContent
 * area side by side. Acts as a thin pass-through for props from App.
 */

import { Movie, CustomTab, CustomSection } from "../types";
import { ThemeConfig } from "../utils/themeConfig";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";

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
  getSectionContent,
}: SidebarLayoutProps) {
  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar
        currentUser={currentUser}
        movies={movies}
        customTabs={customTabs}
        customSections={customSections}
        contentType={contentType}
        activeSection={activeSection}
        expandedCategory={expandedCategory}
        movieCount={movieCount}
        tvShowCount={tvShowCount}
        restaurantCount={restaurantCount}
        placeCount={placeCount}
        currentTheme={currentTheme}
        onContentTypeChange={onContentTypeChange}
        onActiveSectionChange={onActiveSectionChange}
        onExpandedCategoryChange={onExpandedCategoryChange}
        onAddSectionDialogOpen={onAddSectionDialogOpen}
        onAddTabDialogOpen={onAddTabDialogOpen}
        onProfileDialogOpen={onProfileDialogOpen}
        onSettingsDialogOpen={onSettingsDialogOpen}
        onProfileSwitcherOpen={onProfileSwitcherOpen}
        onLogout={onLogout}
        onTabDelete={onTabDelete}
      />

      <MainContent
        movies={movies}
        customTabs={customTabs}
        customSections={customSections}
        contentType={contentType}
        activeSection={activeSection}
        viewMode={viewMode}
        currentTheme={currentTheme}
        onViewModeChange={onViewModeChange}
        onAddDialogOpen={onAddDialogOpen}
        onAddSectionDialogOpen={onAddSectionDialogOpen}
        onShareDialogOpen={onShareDialogOpen}
        onMovieUpdate={onMovieUpdate}
        onMovieDelete={onMovieDelete}
        onMovieClick={onMovieClick}
        getSectionContent={getSectionContent}
      />
    </div>
  );
}
