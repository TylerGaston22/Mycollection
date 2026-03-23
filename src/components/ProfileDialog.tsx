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
import { toast } from "sonner@2.0.3";

import { User as UserType } from "../types/user";
import { Movie } from "../types/movie";
import { CustomTab } from "../types/customTab";
import { CustomSection } from "../types/customSection";

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
  const totalItems = movieCount + tvShowCount + restaurantCount + placeCount;
  const watchedCount = movies?.filter(m => m.status === 'watched').length ?? 0;
  const favoriteCount = movies?.filter(m => m.favorite).length ?? 0;

  const handleExportData = () => {
    const data = {
      movies: movies || [],
      customTabs: customTabs || [],
      customSections: customSections || [],
      exportDate: new Date().toISOString(),
      version: '1.0',
      profile: {
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
      }
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentUser.username}-collection-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Collection exported successfully!', {
      description: 'Your data has been downloaded as a JSON file.'
    });
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (!data.movies || !Array.isArray(data.movies)) {
            throw new Error('Invalid data format: movies array not found');
          }

          if (onImport) {
            onImport({
              movies: data.movies || [],
              customTabs: data.customTabs || [],
              customSections: data.customSections || []
            });
          }

          toast.success('Collection imported successfully!', {
            description: `Imported ${data.movies.length} items, ${data.customTabs?.length || 0} custom categories, and ${data.customSections?.length || 0} custom sections.`
          });

          onOpenChange(false);
        } catch (error) {
          toast.error('Import failed', {
            description: 'The file format is invalid. Please make sure you\'re importing a valid collection backup file.'
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

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
              {currentUser.profileImage ? (
                <AvatarImage src={currentUser.profileImage} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  <User className="h-16 w-16" />
                </AvatarFallback>
              )}
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
                <div className="text-2xl mb-1">{totalItems}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-muted/30">
                <div className="text-2xl mb-1">{watchedCount}</div>
                <div className="text-xs text-muted-foreground">Watched</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-muted/30">
                <div className="text-2xl mb-1">{favoriteCount}</div>
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
