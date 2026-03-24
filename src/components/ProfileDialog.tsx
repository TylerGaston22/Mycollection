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
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { User, Download, Upload, Mail, Calendar, MapPin as MapPinIcon } from 'lucide-react';
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

import { User as UserType, Movie, CustomTab, CustomSection } from "../types";
import { useDataExportImport } from "../hooks/useDataExportImport";

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
  onImport
}: ProfileDialogProps) {
  const { exportData, importData } = useDataExportImport();

  const totalCollectionItemCount = movieCount + tvShowCount + restaurantCount + placeCount;
  const numberOfItemsWatched = movies?.filter((item) => item.status === 'watched').length ?? 0;
  const numberOfItemsFavorited = movies?.filter((item) => item.favorite).length ?? 0;

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
      <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
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
              <div className="text-center p-3 border rounded-lg bg-muted/30">
                <div className="text-2xl mb-1">{totalCollectionItemCount}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-muted/30">
                <div className="text-2xl mb-1">{numberOfItemsWatched}</div>
                <div className="text-xs text-muted-foreground">Watched</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-muted/30">
                <div className="text-2xl mb-1">{numberOfItemsFavorited}</div>
                <div className="text-xs text-muted-foreground">Favorites</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Movies</Badge>
                  <span className="text-sm text-muted-foreground">Films in your collection</span>
                </div>
                <span className="text-lg">{movieCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">TV Shows</Badge>
                  <span className="text-sm text-muted-foreground">Series you're tracking</span>
                </div>
                <span className="text-lg">{tvShowCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Restaurants</Badge>
                  <span className="text-sm text-muted-foreground">Places to eat</span>
                </div>
                <span className="text-lg">{restaurantCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Places</Badge>
                  <span className="text-sm text-muted-foreground">Destinations to visit</span>
                </div>
                <span className="text-lg">{placeCount}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Management */}
          <div className="space-y-3">
            <h4>Data Management</h4>
            <p className="text-sm text-muted-foreground">
              Export your collection to backup your data or import a previously saved collection.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={handleExportData}
              >
                <Download className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">Export</div>
                  <div className="text-xs text-muted-foreground">Download backup</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={handleImportData}
              >
                <Upload className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium">Import</div>
                  <div className="text-xs text-muted-foreground">Restore backup</div>
                </div>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Exported data includes: Movies ({movieCount}), TV Shows ({tvShowCount}), Restaurants ({restaurantCount}), Places ({placeCount}), Custom Categories ({customTabs?.length || 0}), and Custom Sections ({customSections?.length || 0}).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
