/**
 * SettingsDialog – app settings with two tabs: Appearance and Account.
 * Appearance tab: per-category colour theme pickers via ColorPicker.
 * Account tab: CSV/TXT export and import, with a link to the
 * FormatGuideDialog for import formatting help.
 */

import { useState } from 'react';
import { Lock, Palette, Info, ImageIcon, Film, Tv, UtensilsCrossed, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { DataManagementButtons } from "../DataManagementButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Movie, CustomTab, CustomSection } from "../../types";
import { ColorPicker } from "../ColorPicker";
import { FormatGuideDialog } from "./FormatGuideDialog";
import { useDataExportImport } from "../../hooks/useDataExportImport";

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
  onBackgroundColorsChange: (colors: { movie: string; 'tv-show': string; restaurant: string; place: string }) => void;
}

export function SettingsDialog({ open, onOpenChange, movies, customTabs, customSections, onImport, backgroundColors, onBackgroundColorsChange }: SettingsDialogProps) {
  const [isFormatGuideDialogOpen, setIsFormatGuideDialogOpen] = useState(false);
  const { bulkImportCsv, exportCsv } = useDataExportImport();

  const updateColor = (type: 'movie' | 'tv-show' | 'restaurant' | 'place', colorId: string) => {
    onBackgroundColorsChange({ ...backgroundColors, [type]: colorId });
  };

  const handleExportCsv = () => {
    exportCsv(movies || []);
  };

  const handleImportCsv = () => {
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
                    Export your collection as CSV or import from a CSV/TXT file.
                  </p>
                  <DataManagementButtons onExport={handleExportCsv} onImport={handleImportCsv} />
                  <p className="text-xs text-muted-foreground">
                    {totalMoviesCount} items in your collection.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsFormatGuideDialogOpen(true)}>
                      <Info className="h-4 w-4 mr-1" />
                      Import Format Guide
                    </Button>
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
