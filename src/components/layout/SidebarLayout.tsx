/**
 * SidebarLayout – top-level layout wrapper that picks mobile vs desktop.
 * Desktop: Sidebar + DesktopMainContent side by side.
 * Mobile: MobileHeader + MobileMainContent + MobileBottomNav stacked.
 * Each branch uses its own dedicated content component so the two layouts
 * can be styled independently.
 */

import { Menu } from "lucide-react";
import { useToggle } from "../../hooks/useToggle";
import { Item, CustomTab, CustomSection, User } from "../../types";
import { ThemeConfig } from "../../utils/themeConfig";
import { getCategoryDisplayName } from "../../utils/contentHelpers";
import { useIsMobile } from "../../hooks/useIsMobile";
import { Sidebar } from "../navigation/Sidebar";
import { DesktopMainContent } from "./DesktopMainContent";
import { MobileMainContent } from "./MobileMainContent";
import { MobileHeader } from "../mobile/MobileHeader";
import { MobileBottomNav } from "../mobile/MobileBottomNav";
import { MobileSectionNav } from "../mobile/MobileSectionNav";

interface SidebarLayoutProps {
  currentUser: User;
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
  currentTheme: ThemeConfig;
  isBookstoreActive: boolean;
  onToggleBookstore: () => void;
  onContentTypeChange: (type: string) => void;
  onActiveSectionChange: (section: string) => void;
  onExpandedCategoryChange: (category: string) => void;

  onAddDialogOpen: () => void;
  onAddSectionDialogOpen: () => void;
  onAddTabDialogOpen: () => void;
  onProfileDialogOpen: () => void;
  onSettingsDialogOpen: () => void;
  onFriendsDialogOpen: () => void;
  onLogout: () => void;
  onTabDelete: (tab: CustomTab) => void;
  onItemUpdate: (id: string, updates: Partial<Item>) => void;
  onItemDelete: (id: string) => void;
  onItemClick: (item: Item) => void;
  onShareDialogOpen: () => void;
  getSectionContent: (sectionId: string) => Item[];
  pendingFriendRequestsCount: number;
}

export function SidebarLayout({
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
  currentTheme,
  isBookstoreActive,
  onToggleBookstore,
  onContentTypeChange,
  onActiveSectionChange,
  onExpandedCategoryChange,

  onAddDialogOpen,
  onAddSectionDialogOpen,
  onAddTabDialogOpen,
  onProfileDialogOpen,
  onSettingsDialogOpen,
  onFriendsDialogOpen,
  onLogout,
  onTabDelete,
  onItemUpdate,
  onItemDelete,
  onItemClick,
  onShareDialogOpen,
  getSectionContent,
  pendingFriendRequestsCount,
}: SidebarLayoutProps) {
  const isMobile = useIsMobile();
  // Slide-out state for narrow desktop widths (< lg breakpoint). The
  // sidebar is always rendered; visibility flips via translate-x classes
  // inside the Sidebar component itself. At lg+ a CSS override forces
  // the sidebar visible regardless of this state.
  const sidebar = useToggle(false);

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

        <MobileMainContent
          items={items}
          customTabs={customTabs}
          customSections={customSections}
          contentType={contentType}
          activeSection={activeSection}
          currentTheme={currentTheme}
          onAddDialogOpen={onAddDialogOpen}
          onItemUpdate={onItemUpdate}
          onItemClick={onItemClick}
          getSectionContent={getSectionContent}
          mobileSectionNav={
            <MobileSectionNav
              contentType={contentType}
              activeSection={activeSection}
              currentTheme={currentTheme}
              items={items}
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
          gameCount={gameCount}
          currentTheme={currentTheme}
          onContentTypeChange={onContentTypeChange}
          onAddTabDialogOpen={onAddTabDialogOpen}
          items={items}
        />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Hamburger toggle — the .hamburger-toggle CSS rule (in index.css)
          hides this at 1024px+ via a media query. */}
      <button
        type="button"
        onClick={sidebar.toggle}
        aria-label="Toggle sidebar"
        className="hamburger-toggle fixed top-4 left-4 z-50 p-2 rounded-md bg-page-surface backdrop-blur-sm text-page-fg hover:bg-page-surface-hover transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop dimmer — only when the slide-out is open. Auto-hidden
          at 1024px+ by .sidebar-backdrop media query. */}
      {sidebar.value && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={sidebar.off}
          className="sidebar-backdrop fixed inset-0 z-30 backdrop-blur-sm"
          style={{ backgroundColor: 'var(--page-backdrop)' }}
        />
      )}

      <Sidebar
        currentUser={currentUser}
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
        isBookstoreActive={isBookstoreActive}
        onToggleBookstore={onToggleBookstore}
        onContentTypeChange={onContentTypeChange}
        onActiveSectionChange={onActiveSectionChange}
        onExpandedCategoryChange={onExpandedCategoryChange}
        onAddSectionDialogOpen={onAddSectionDialogOpen}
        onAddTabDialogOpen={onAddTabDialogOpen}
        onProfileDialogOpen={onProfileDialogOpen}
        onSettingsDialogOpen={onSettingsDialogOpen}
        onFriendsDialogOpen={onFriendsDialogOpen}
        onLogout={onLogout}
        onTabDelete={onTabDelete}
        pendingFriendRequestsCount={pendingFriendRequestsCount}
        isOpen={sidebar.value}
        onClose={sidebar.off}
      />

      <DesktopMainContent
        items={items}
        customTabs={customTabs}
        customSections={customSections}
        contentType={contentType}
        activeSection={activeSection}
        currentTheme={currentTheme}
        onAddDialogOpen={onAddDialogOpen}
        onAddSectionDialogOpen={onAddSectionDialogOpen}
        onShareDialogOpen={onShareDialogOpen}
        onItemUpdate={onItemUpdate}
        onItemDelete={onItemDelete}
        onItemClick={onItemClick}
        getSectionContent={getSectionContent}
      />
    </div>
  );
}
