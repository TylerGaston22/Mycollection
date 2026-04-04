/**
 * ProfileDialog – user profile view and collection statistics.
 * Shows the avatar, bio, contact info, and a breakdown of collection
 * counts by category. Also includes JSON export/import via the shared
 * useDataExportImport hook.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { User, Mail, Calendar, MapPin as MapPinIcon } from 'lucide-react';
import { Separator } from "../ui/separator";
import { DataManagementButtons } from "../DataManagementButtons";
import { CategoryCountRow } from "../CategoryCountRow";

import { User as UserType, Movie, CustomTab, CustomSection } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { useDataExportImport } from "../../hooks/useDataExportImport";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: UserType;
  movieCount: number;
  tvShowCount: number;
  restaurantCount: number;
  placeCount: number;
  movies?: Movie[];
  customTabs?: CustomTab[];
  customSections?: CustomSection[];
  currentTheme?: ThemeConfig;
  onImport?: (data: { movies: Movie[], customTabs: CustomTab[], customSections: CustomSection[] }) => void;
}

export function ProfileDialog({
  open,
  onOpenChange,
  currentUser,
  movieCount,
  tvShowCount,
  restaurantCount,
  placeCount,
  movies,
  customTabs,
  customSections,
  currentTheme,
  onImport
}: ProfileDialogProps) {
  const { exportData, importData } = useDataExportImport();

  const totalCollectionItemCount = movieCount + tvShowCount + restaurantCount + placeCount;
  const numberOfItemsWatched = movies?.filter((collectionItem) => collectionItem.status === 'watched').length ?? 0;
  const numberOfItemsFavorited = movies?.filter((collectionItem) => collectionItem.favorite).length ?? 0;

  const handleExportData = () => {
    exportData({
      movies: movies || [],
      customTabs: customTabs || [],
      customSections: customSections || [],
      filenamePrefix: `${currentUser.username}-collection`,
      profileInfo: {
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
      },
    });
  };

  const handleImportData = () => {
    if (!onImport) return;
    importData(onImport, () => onOpenChange(false));
  };

  let avatarContent;
  if (currentUser.profileImage) {
    avatarContent = <AvatarImage src={currentUser.profileImage} alt="Profile" />;
  } else {
    avatarContent = (
      <AvatarFallback
        className="text-primary-foreground text-3xl"
        style={currentTheme ? {
          background: `linear-gradient(to bottom right, ${currentTheme.accentColor}, ${colorToRgba(currentTheme.accentColor, 0.8)})`,
        } : undefined}
      >
        <User className="h-16 w-16" />
      </AvatarFallback>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            View your profile and collection stats
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              {avatarContent}
            </Avatar>
            <div className="text-center">
              <h3 className="mb-1">{currentUser.name}</h3>
              <p className="text-muted-foreground">{currentUser.username}</p>
            </div>
          </div>

          <Separator />

          {/* Profile Information */}
          <div className="space-y-4">
            {currentUser.bio && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">About</p>
                <p className="text-sm">{currentUser.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined {currentUser.joinDate}</span>
              </div>
              {currentUser.location && (
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{currentUser.location}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div className="space-y-4">
            <h4>Collection Overview</h4>

            <div className="grid grid-cols-3 gap-3">
              <div
                className="text-center p-3 border rounded-lg bg-muted/30"
                style={currentTheme ? { borderColor: colorToRgba(currentTheme.accentColor, 0.3) } : undefined}
              >
                <div className="text-2xl mb-1" style={currentTheme ? { color: currentTheme.accentColor } : undefined}>{totalCollectionItemCount}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
              <div
                className="text-center p-3 border rounded-lg bg-muted/30"
                style={currentTheme ? { borderColor: colorToRgba(currentTheme.accentColor, 0.3) } : undefined}
              >
                <div className="text-2xl mb-1" style={currentTheme ? { color: currentTheme.accentColor } : undefined}>{numberOfItemsWatched}</div>
                <div className="text-xs text-muted-foreground">Watched</div>
              </div>
              <div
                className="text-center p-3 border rounded-lg bg-muted/30"
                style={currentTheme ? { borderColor: colorToRgba(currentTheme.accentColor, 0.3) } : undefined}
              >
                <div className="text-2xl mb-1" style={currentTheme ? { color: currentTheme.accentColor } : undefined}>{numberOfItemsFavorited}</div>
                <div className="text-xs text-muted-foreground">Favorites</div>
              </div>
            </div>

            <div className="space-y-2">
              <CategoryCountRow label="Movies" description="Films in your collection" count={movieCount} />
              <CategoryCountRow label="TV Shows" description="Series you're tracking" count={tvShowCount} />
              <CategoryCountRow label="Restaurants" description="Places to eat" count={restaurantCount} />
              <CategoryCountRow label="Places" description="Destinations to visit" count={placeCount} />
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-3">
            <h4>Data Management</h4>
            <p className="text-sm text-muted-foreground">
              Export your collection to backup your data or import a previously saved collection.
            </p>
            <DataManagementButtons onExport={handleExportData} onImport={handleImportData} />
            <p className="text-xs text-muted-foreground">
              Exported data includes: Movies ({movieCount}), TV Shows ({tvShowCount}), Restaurants ({restaurantCount}), Places ({placeCount}), Custom Categories ({customTabs?.length || 0}), and Custom Sections ({customSections?.length || 0}).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
