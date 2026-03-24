import { useState, useEffect } from 'react';
import { SidebarLayout } from "./components/SidebarLayout";
import { LandingPage } from "./components/LandingPage";
import { SignInPage } from "./components/SignInPage";
import { MovieFormDialog } from "./components/MovieFormDialog";
import { ProfileDialog } from "./components/ProfileDialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { MovieDetailDialog } from "./components/MovieDetailDialog";
import { AddTabDialog } from "./components/AddTabDialog";
import { AddSectionDialog } from "./components/AddSectionDialog";
import { ShareDialog } from "./components/ShareDialog";
import { ProfileSwitcherDialog } from "./components/ProfileSwitcherDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { Toaster } from "./components/ui/sonner";
import ghibliBackground from 'figma:asset/dd104f7b8489f1285cea3966c272ab6ab1c18fb9.png';
import { Movie, CustomTab, CustomSection } from "./types";
import { getTheme } from "./utils/themeConfig";
import { getSectionDisplayName, getCategoryDisplayName, getSectionContent } from "./utils/contentHelpers";
import { useAuth } from "./hooks/useAuth";
import { useMovies } from "./hooks/useMovies";
import { useCustomTabs, useCustomSections } from "./hooks/useCollections";
import { usePreferences } from "./hooks/usePreferences";

export default function App() {
  const auth = useAuth();
  const { backgroundColors, setBackgroundColors } = usePreferences(auth.currentUserId);
  const { movies, setMovies, addMovie, updateMovie, deleteMovie, removeByType, importMovies } = useMovies(auth.currentUserId);
  const { customTabs, setCustomTabs, addCustomTab: addTab, removeTab } = useCustomTabs(auth.currentUserId);
  const { customSections, setCustomSections, addCustomSection: addSection, removeByContentType } = useCustomSections(auth.currentUserId);

  // UI state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddTabDialogOpen, setIsAddTabDialogOpen] = useState(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [contentType, setContentType] = useState<string>('movie');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [tabToDelete, setTabToDelete] = useState<CustomTab | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string>('movie');

  // Reset to "all" section when content type changes
  useEffect(() => {
    setActiveSection('all');
  }, [contentType]);

  // Cross-cutting handlers
  const handleAddCustomTab = (tab: Omit<CustomTab, 'id'>) => {
    const newTab = addTab(tab);
    setContentType(newTab.id);
  };

  const handleAddCustomSection = (section: Omit<CustomSection, 'id'>) => {
    const newSection = addSection(section);
    setActiveSection(newSection.id);
  };

  const handleDeleteCustomTab = (tabId: string) => {
    removeTab(tabId);
    removeByType(tabId);
    removeByContentType(tabId);
    if (contentType === tabId) setContentType('movie');
    setTabToDelete(null);
  };

  const handleImportData = (data: { movies: Movie[]; customTabs: CustomTab[]; customSections: CustomSection[] }) => {
    importMovies(data.movies);
    setCustomTabs(data.customTabs);
    setCustomSections(data.customSections);
  };

  // Counts
  const movieCount = movies.filter((collectionItem) => collectionItem.type === 'movie').length;
  const tvShowCount = movies.filter((collectionItem) => collectionItem.type === 'tv-show').length;
  const restaurantCount = movies.filter((collectionItem) => collectionItem.type === 'restaurant').length;
  const placeCount = movies.filter((collectionItem) => collectionItem.type === 'place').length;

  // Theme
  const activeThemeId = backgroundColors[contentType as keyof typeof backgroundColors] || 'current';
  const currentTheme = getTheme(activeThemeId);

  // Bound helpers
  const getItemsForSection = (sectionId: string) => getSectionContent(sectionId, movies, contentType);

  // Decide what page to show based on auth state
  let mainPageContent;
  if (!auth.isSignedIn) {
    if (auth.showSignInPage) {
      mainPageContent = (
        <SignInPage onSignIn={auth.handleSignIn} onBack={auth.handleBackToLanding} />
      );
    } else {
      mainPageContent = (
        <LandingPage onSignIn={auth.handleGoToSignIn} />
      );
    }
  } else {
    mainPageContent = (
      <>
        <SidebarLayout
          currentUser={auth.currentUser}
          movies={movies}
          customTabs={customTabs}
          customSections={customSections}
          contentType={contentType}
          activeSection={activeSection}
          expandedCategory={expandedCategory}
          viewMode={viewMode}
          movieCount={movieCount}
          tvShowCount={tvShowCount}
          restaurantCount={restaurantCount}
          placeCount={placeCount}
          currentTheme={currentTheme}
          onContentTypeChange={setContentType}
          onActiveSectionChange={setActiveSection}
          onExpandedCategoryChange={setExpandedCategory}
          onViewModeChange={setViewMode}
          onAddDialogOpen={() => setIsAddDialogOpen(true)}
          onAddSectionDialogOpen={() => setIsAddSectionDialogOpen(true)}
          onAddTabDialogOpen={() => setIsAddTabDialogOpen(true)}
          onProfileDialogOpen={() => setIsProfileDialogOpen(true)}
          onSettingsDialogOpen={() => setIsSettingsDialogOpen(true)}
          onProfileSwitcherOpen={() => setIsProfileSwitcherOpen(true)}
          onLogout={auth.handleLogout}
          onTabDelete={(tab) => setTabToDelete(tab)}
          onMovieUpdate={updateMovie}
          onMovieDelete={deleteMovie}
          onMovieClick={setSelectedMovie}
          onShareDialogOpen={() => setIsShareDialogOpen(true)}
          getSectionContent={getItemsForSection}
        />

        <MovieFormDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAdd={addMovie}
          contentType={contentType}
          customSections={customSections}
          activeSection={activeSection}
        />

        <AddTabDialog
          open={isAddTabDialogOpen}
          onOpenChange={setIsAddTabDialogOpen}
          onAdd={handleAddCustomTab}
        />

        <AddSectionDialog
          open={isAddSectionDialogOpen}
          onOpenChange={setIsAddSectionDialogOpen}
          onAdd={handleAddCustomSection}
          contentType={contentType}
        />

        <ProfileDialog
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
          currentUser={auth.currentUser}
          movieCount={movieCount}
          tvShowCount={tvShowCount}
          restaurantCount={restaurantCount}
          placeCount={placeCount}
          movies={movies}
          customTabs={customTabs}
          customSections={customSections}
          onImport={handleImportData}
        />

        <ProfileSwitcherDialog
          open={isProfileSwitcherOpen}
          onOpenChange={setIsProfileSwitcherOpen}
          users={auth.users}
          currentUserId={auth.currentUserId}
          onSwitchProfile={auth.handleSwitchProfile}
        />

        <SettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
          movies={movies}
          customTabs={customTabs}
          customSections={customSections}
          onImport={handleImportData}
          backgroundColors={backgroundColors}
          onBackgroundColorsChange={setBackgroundColors}
        />

        <MovieDetailDialog
          movie={selectedMovie}
          open={!!selectedMovie}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              setSelectedMovie(null);
            }
          }}
          onUpdate={updateMovie}
          customSections={customSections}
        />

        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          movies={getItemsForSection(activeSection)}
          categoryName={getCategoryDisplayName(contentType, customTabs)}
          sectionName={getSectionDisplayName(activeSection, contentType, customSections, customTabs)}
        />

        <AlertDialog
          open={!!tabToDelete}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              setTabToDelete(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{tabToDelete?.name}" Tab?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this tab and all {movies.filter((collectionItem) => collectionItem.type === tabToDelete?.id).length} items associated with it. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (tabToDelete) {
                    handleDeleteCustomTab(tabToDelete.id);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Tab
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${ghibliBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.05,
          filter: 'brightness(0.6)',
        }}
      />

      {/* Theme gradient */}
      <div
        className="fixed inset-0 z-0"
        style={{ background: currentTheme.backgroundGradient, opacity: 0.95 }}
      />

      {mainPageContent}

      <Toaster />
    </div>
  );
}
