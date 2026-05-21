/**
 * App – root component and application shell.
 * Owns all top-level state (auth, collection data, UI dialogs) and
 * delegates rendering to SidebarLayout (when signed in) or the
 * landing/sign-in pages (when signed out). All modal dialogs are
 * mounted here so they share a single source of truth for data.
 */

import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { SidebarLayout } from "./components/layout/SidebarLayout";
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ItemFormDialog } from "./components/dialogs/ItemFormDialog";
import { ProfileDialog } from "./components/dialogs/ProfileDialog";
import { SettingsDialog } from "./components/dialogs/SettingsDialog";
import { ItemDetailDialog } from "./components/dialogs/ItemDetailDialog";
import { AddTabDialog } from "./components/dialogs/AddTabDialog";
import { AddSectionDialog } from "./components/dialogs/AddSectionDialog";
import { ShareDialog } from "./components/dialogs/ShareDialog";
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
import ghibliBackground from './assets/ghibli-background.png';
import { Item, CustomTab, CustomSection } from "./types";
import { getTheme } from "./utils/themeConfig";
import { getSectionDisplayName, getCategoryDisplayName, getSectionContent } from "./utils/contentHelpers";
import { useAuth } from "./hooks/useAuth";
import { useItems } from "./hooks/useItems";
import { useCustomTabs, useCustomSections } from "./hooks/useCollections";
import { usePreferences } from "./hooks/usePreferences";
import { useDialogState } from "./hooks/useDialogState";
import { useCollectionStats } from "./hooks/useCollectionStats";
import { DEFAULT_CONTENT_TYPE } from "./constants";

export default function App() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const auth = useAuth();
  const { backgroundColors, setBackgroundColors, isLoading: prefsLoading } = usePreferences(auth.currentUserId, auth.isDemoUser);
  const { items, setItems, addItem, updateItem, deleteItem, removeByType, importItems, isLoading: itemsLoading } = useItems(auth.currentUserId, auth.isDemoUser);
  const { customTabs, setCustomTabs, addCustomTab: addTab, removeTab, isLoading: tabsLoading } = useCustomTabs(auth.currentUserId, auth.isDemoUser);
  const { customSections, setCustomSections, addCustomSection: addSection, removeByContentType, isLoading: sectionsLoading } = useCustomSections(auth.currentUserId, auth.isDemoUser);

  // After a successful Supabase sign-in the auth state flips to signed-in
  // before the data hooks have finished fetching. Keep the SignInPage mounted
  // (with its spinner forced on) until everything is loaded so the user
  // doesn't see a flash of the previous (demo) collection.
  const isHydratingUserData = auth.isSignedIn && (itemsLoading || tabsLoading || sectionsLoading || prefsLoading);

  // Dialog open/close state, keyed by dialog name
  const dialogs = useDialogState();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [contentType, setContentType] = useState<string>(DEFAULT_CONTENT_TYPE);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [tabToDelete, setTabToDelete] = useState<CustomTab | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string>(DEFAULT_CONTENT_TYPE);

  // Reset to "all" section when content type changes
  useEffect(() => {
    setActiveSection('all');
  }, [contentType]);

  // Cross-cutting handlers
  const handleAddCustomTab = async (tab: Omit<CustomTab, 'id'>) => {
    const newTab = await addTab(tab);
    setContentType(newTab.id);
  };

  const handleAddCustomSection = async (section: Omit<CustomSection, 'id'>) => {
    const newSection = await addSection(section);
    setActiveSection(newSection.id);
  };

  // Cascade-delete: remove the tab, its items, and its sections, then fall back to 'item'
  const handleDeleteCustomTab = (tabId: string) => {
    removeTab(tabId);
    removeByType(tabId);
    removeByContentType(tabId);
    if (contentType === tabId) setContentType(DEFAULT_CONTENT_TYPE);
    setTabToDelete(null);
  };

  const handleImportData = (data: { items: Item[]; customTabs: CustomTab[]; customSections: CustomSection[] }) => {
    importItems(data.items);
    setCustomTabs(data.customTabs);
    setCustomSections(data.customSections);
  };

  const { movieCount, tvShowCount, restaurantCount, placeCount } = useCollectionStats(items);

  // Custom tabs don't have a saved theme, so fall back to 'current' (default Ghibli theme)
  const activeThemeId = backgroundColors[contentType as keyof typeof backgroundColors] || 'current';
  const currentTheme = getTheme(activeThemeId);

  // Bound helpers
  const getItemsForSection = (sectionId: string) => getSectionContent(sectionId, items, contentType);

  // Decide what page to show based on auth state.
  // When signed in but still hydrating, we keep SignInPage mounted with
  // externalLoading=true so its spinner stays visible during the transition.
  let mainPageContent;
  if (auth.showPasswordResetPage) {
    // User just clicked the password-reset link from their email — force
    // the reset page on top until they pick a new password (or refresh).
    mainPageContent = (
      <ResetPasswordPage onChangePassword={auth.handleChangePassword} />
    );
  } else if (!auth.isSignedIn || isHydratingUserData) {
    if (auth.showSignInPage || isHydratingUserData) {
      mainPageContent = (
        <SignInPage
          onSignIn={auth.handleSignIn}
          onSignUp={auth.handleSignUp}
          onForgotPassword={auth.handleResetPasswordRequest}
          onBack={auth.handleBackToLanding}
          externalLoading={isHydratingUserData}
        />
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
          items={items}
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
          onContentTypeChange={setContentType}
          onActiveSectionChange={setActiveSection}
          onExpandedCategoryChange={setExpandedCategory}

          onAddDialogOpen={() => dialogs.open('add')}
          onAddSectionDialogOpen={() => dialogs.open('addSection')}
          onAddTabDialogOpen={() => dialogs.open('addTab')}
          onProfileDialogOpen={() => dialogs.open('profile')}
          onSettingsDialogOpen={() => dialogs.open('settings')}
          onLogout={auth.handleLogout}
          onTabDelete={(tab) => setTabToDelete(tab)}
          onItemUpdate={updateItem}
          onItemDelete={deleteItem}
          onItemClick={setSelectedItem}
          onShareDialogOpen={() => dialogs.open('share')}
          getSectionContent={getItemsForSection}
        />

        <ItemFormDialog
          open={dialogs.isOpen('add')}
          onOpenChange={(v) => dialogs.setOpen('add', v)}
          onAdd={addItem}
          contentType={contentType}
          customSections={customSections}
          activeSection={activeSection}
          currentTheme={currentTheme}
        />

        <AddTabDialog
          open={dialogs.isOpen('addTab')}
          onOpenChange={(v) => dialogs.setOpen('addTab', v)}
          onAdd={handleAddCustomTab}
          currentTheme={currentTheme}
        />

        <AddSectionDialog
          open={dialogs.isOpen('addSection')}
          onOpenChange={(v) => dialogs.setOpen('addSection', v)}
          onAdd={handleAddCustomSection}
          contentType={contentType}
          currentTheme={currentTheme}
        />

        <ProfileDialog
          open={dialogs.isOpen('profile')}
          onOpenChange={(v) => dialogs.setOpen('profile', v)}
          currentUser={auth.currentUser}
          movieCount={movieCount}
          tvShowCount={tvShowCount}
          restaurantCount={restaurantCount}
          placeCount={placeCount}
          items={items}
          customTabs={customTabs}
          customSections={customSections}
          currentTheme={currentTheme}
          onImport={handleImportData}
        />

        <SettingsDialog
          open={dialogs.isOpen('settings')}
          onOpenChange={(v) => dialogs.setOpen('settings', v)}
          items={items}
          customTabs={customTabs}
          customSections={customSections}
          onImport={handleImportData}
          backgroundColors={backgroundColors}
          onBackgroundColorsChange={setBackgroundColors}
          currentUser={auth.currentUser}
          onUpdateProfile={auth.handleUpdateProfile}
          onUpdateEmail={auth.handleUpdateEmail}
        />

        <ItemDetailDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              setSelectedItem(null);
            }
          }}
          onUpdate={updateItem}
          customSections={customSections}
          currentTheme={currentTheme}
        />

        <ShareDialog
          open={dialogs.isOpen('share')}
          onOpenChange={(v) => dialogs.setOpen('share', v)}
          items={getItemsForSection(activeSection)}
          categoryName={getCategoryDisplayName(contentType, customTabs)}
          sectionName={getSectionDisplayName(activeSection, contentType, customSections, customTabs)}
          currentTheme={currentTheme}
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
                This will permanently delete this tab and all {items.filter((collectionItem) => collectionItem.type === tabToDelete?.id).length} items associated with it. This action cannot be undone.
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
    <div className="min-h-screen bg-background">
      {/* Light-mode-only decorative background: Ghibli image + theme gradient.
          In dark mode, we let bg-background show through for a flat, clean look. */}
      {!isDark && (
        <>
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
          <div
            className="fixed inset-0 z-0"
            style={{ background: currentTheme.backgroundGradient, opacity: 0.95 }}
          />
        </>
      )}

      {mainPageContent}

      <Toaster />
    </div>
  );
}
