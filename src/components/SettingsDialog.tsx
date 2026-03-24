/**
 * SettingsDialog – app settings with two tabs: Appearance and Account.
 * Appearance tab: per-category colour theme pickers via ColorPicker.
 * Account tab: JSON export/import, CSV/TXT bulk import, and a link
 * to the FormatGuideDialog for import formatting help.
 */

import { useState } from 'react';
import { Lock, Palette, Upload, FileText, Info, ImageIcon, Film, Tv, UtensilsCrossed, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { DataManagementButtons } from "./DataManagementButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Movie, CustomTab, CustomSection } from "../types";
import { ColorPicker } from "./ColorPicker";
import { FormatGuideDialog } from "./FormatGuideDialog";
import { useDataExportImport } from "../hooks/useDataExportImport";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movies?: Movie[];
  customTabs?: CustomTab[];
  customSections?: CustomSection[];
  onImport?: (data: { movies: Movie[], customTabs: CustomTab[], customSections: CustomSection[] }) => void;
  backgroundColors: {
    movie: string;
    'tv-show': string;
    restaurant: string;
    place: string;
  };
  onBackgroundColorsChange: (colors: any) => void;
}

export function SettingsDialog({ open, onOpenChange, movies, customTabs, customSections, onImport, backgroundColors, onBackgroundColorsChange }: SettingsDialogProps) {
  const [isFormatGuideDialogOpen, setIsFormatGuideDialogOpen] = useState(false);
  const { exportData, importData, bulkImportCsv } = useDataExportImport();

  const updateColor = (type: 'movie' | 'tv-show' | 'restaurant' | 'place', colorId: string) => {
    onBackgroundColorsChange({ ...backgroundColors, [type]: colorId });
  };

  const handleExportData = () => {
    exportData({
      movies: movies || [],
      customTabs: customTabs || [],
      customSections: customSections || [],
    });
  };

  const handleImportData = () => {
    if (!onImport) return;
    importData(onImport, () => onOpenChange(false));
  };

  const handleBulkImport = () => {
    if (!onImport) return;
    bulkImportCsv(
      movies || [],
      onImport,
      customTabs || [],
      customSections || [],
      () => onOpenChange(false),
    );
  };

  const totalMoviesCount = movies?.length ?? 0;
  const totalCustomTabsCount = customTabs?.length ?? 0;
  const totalCustomSectionsCount = customSections?.length ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Customize your app experience</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="account">
                <Lock className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Tab Backgrounds
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">Customize the background for each section</p>
                </div>
                <ColorPicker label="Movies Background" icon={Film} type="movie" selectedColor={backgroundColors.movie} onColorChange={updateColor} />
                <ColorPicker label="TV Shows Background" icon={Tv} type="tv-show" selectedColor={backgroundColors['tv-show']} onColorChange={updateColor} />
                <ColorPicker label="Restaurants Background" icon={UtensilsCrossed} type="restaurant" selectedColor={backgroundColors.restaurant} onColorChange={updateColor} />
                <ColorPicker label="Places Background" icon={MapPin} type="place" selectedColor={backgroundColors.place} onColorChange={updateColor} />
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4>Data Management</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your collection to backup your data or import a previously saved collection.
                  </p>
                  <DataManagementButtons onExport={handleExportData} onImport={handleImportData} />
                  <p className="text-xs text-muted-foreground">
                    Exported data includes: Movies ({totalMoviesCount}), TV Shows, Restaurants, Places, Custom Categories ({totalCustomTabsCount}), and Custom Sections ({totalCustomSectionsCount}).
                  </p>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Bulk Import from CSV/TXT
                    </h4>
                    <p className="text-sm text-muted-foreground">Import multiple items at once using a CSV or TXT file.</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={handleBulkImport}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CSV/TXT
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setIsFormatGuideDialogOpen(true)} title="View format guide">
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-xs text-muted-foreground">
                      💡 <strong>Tip:</strong> Click the info button to see the required format and copy it for AI tools like ChatGPT to help format your list!
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <FormatGuideDialog open={isFormatGuideDialogOpen} onOpenChange={setIsFormatGuideDialogOpen} />
    </>
  );
}
