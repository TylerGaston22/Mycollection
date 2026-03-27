/**
 * SidebarLayout – top-level layout wrapper.
 * On desktop: composes the fixed Sidebar and scrollable MainContent side by side.
 * On mobile: renders a Goodreads-style layout with a top header, horizontal
 * section chips, full-width content, and a bottom tab bar.
 */

import { Movie, CustomTab, CustomSection, User } from "../types";
import { ThemeConfig } from "../utils/themeConfig";
import { getCategoryDisplayName } from "../utils/contentHelpers";
import { useIsMobile } from "../hooks/useIsMobile";
import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";
import { MobileHeader } from "./mobile/MobileHeader";
import { MobileBottomNav } from "./mobile/MobileBottomNav";
import { MobileSectionNav } from "./mobile/MobileSectionNav";

interface SidebarLayoutProps {
  currentUser: User;
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

  movieCount,
  tvShowCount,
  restaurantCount,
  placeCount,
  currentTheme,
  onContentTypeChange,
  onActiveSectionChange,
  onExpandedCategoryChange,

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
  const isMobile = useIsMobile();

  // Mobile: top header + section chips + full-width content + bottom tab bar
  if (isMobile) {
    return (
      <div className="relative z-10 min-h-screen pt-16 pb-16">
        <MobileHeader
          currentUser={currentUser}
          currentTheme={currentTheme}
          categoryTitle={getCategoryDisplayName(contentType, customTabs)}
          onProfileDialogOpen={onProfileDialogOpen}
          onAddDialogOpen={onAddDialogOpen}
        />

        <MainContent
          movies={movies}
          customTabs={customTabs}
          customSections={customSections}
          contentType={contentType}
          activeSection={activeSection}
          currentTheme={currentTheme}
          onAddDialogOpen={onAddDialogOpen}
          onAddSectionDialogOpen={onAddSectionDialogOpen}
          onShareDialogOpen={onShareDialogOpen}
          onMovieUpdate={onMovieUpdate}
          onMovieDelete={onMovieDelete}
          onMovieClick={onMovieClick}
          getSectionContent={getSectionContent}
          isMobile={true}
          mobileSectionNav={
            <MobileSectionNav
              contentType={contentType}
              activeSection={activeSection}
              currentTheme={currentTheme}
              movies={movies}
              customSections={customSections}
              onActiveSectionChange={onActiveSectionChange}
              onAddSectionDialogOpen={onAddSectionDialogOpen}
            />
          }
        />

        <MobileBottomNav
          contentType={contentType}
          customTabs={customTabs}
          movieCount={movieCount}
          tvShowCount={tvShowCount}
          restaurantCount={restaurantCount}
          placeCount={placeCount}
          currentTheme={currentTheme}
          onContentTypeChange={onContentTypeChange}
          onAddTabDialogOpen={onAddTabDialogOpen}
          movies={movies}
        />
      </div>
    );
  }

  // Desktop: sidebar + main content side by side
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
        currentTheme={currentTheme}
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
