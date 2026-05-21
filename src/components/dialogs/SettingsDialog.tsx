/**
 * SettingsDialog – app settings with two tabs: Appearance and Account.
 * Appearance tab: per-category colour theme pickers via ColorPicker.
 * Account tab: CSV/TXT export and import, with a link to the
 * FormatGuideDialog for import formatting help.
 */

import { useEffect, useState } from 'react';
import { Lock, Palette, Info, ImageIcon, Film, Tv, UtensilsCrossed, MapPin, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DataManagementButtons } from "../settings/DataManagementButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Item, CustomTab, CustomSection } from "../../types";
import type { User } from "../../types";
import { ColorPicker } from "../settings/ColorPicker";
import { FormatGuideDialog } from "./FormatGuideDialog";
import { useDataExportImport } from "../../hooks/useDataExportImport";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: Item[];
  customTabs?: CustomTab[];
  customSections?: CustomSection[];
  onImport?: (data: { items: Item[], customTabs: CustomTab[], customSections: CustomSection[] }) => void;
  backgroundColors: {
    item: string;
    'tv-show': string;
    restaurant: string;
    place: string;
  };
  onBackgroundColorsChange: (colors: { item: string; 'tv-show': string; restaurant: string; place: string }) => void;
  currentUser: User;
  onUpdateProfile: (updates: { name?: string }) => Promise<boolean>;
}

export function SettingsDialog({ open, onOpenChange, items, customTabs, customSections, onImport, backgroundColors, onBackgroundColorsChange, currentUser, onUpdateProfile }: SettingsDialogProps) {
  const [isFormatGuideDialogOpen, setIsFormatGuideDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const { bulkImportCsv, exportCsv } = useDataExportImport();

  // Reset the name field whenever the dialog opens or the current user changes,
  // so reopening doesn't show stale input from a previous edit attempt.
  useEffect(() => {
    if (open) setDisplayName(currentUser.name);
  }, [open, currentUser.name]);

  const isNameDirty = displayName.trim() !== currentUser.name && displayName.trim().length > 0;

  const handleSaveName = async () => {
    setIsSavingName(true);
    await onUpdateProfile({ name: displayName });
    setIsSavingName(false);
  };

  const updateColor = (type: 'item' | 'tv-show' | 'restaurant' | 'place', colorId: string) => {
    onBackgroundColorsChange({ ...backgroundColors, [type]: colorId });
  };

  const handleExportCsv = () => {
    exportCsv(items || []);
  };

  const handleImportCsv = () => {
    if (!onImport) return;
    bulkImportCsv(
      items || [],
      onImport,
      customTabs || [],
      customSections || [],
      () => onOpenChange(false),
    );
  };

  const totalMoviesCount = items?.length ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Customize your app experience</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="account" className="w-full">
            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Tab Backgrounds
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">Customize the background for each section</p>
                </div>
                <ColorPicker label="Movies Background" icon={Film} type="item" selectedColor={backgroundColors.item} onColorChange={updateColor} />
                <ColorPicker label="TV Shows Background" icon={Tv} type="tv-show" selectedColor={backgroundColors['tv-show']} onColorChange={updateColor} />
                <ColorPicker label="Restaurants Background" icon={UtensilsCrossed} type="restaurant" selectedColor={backgroundColors.restaurant} onColorChange={updateColor} />
                <ColorPicker label="Places Background" icon={MapPin} type="place" selectedColor={backgroundColors.place} onColorChange={updateColor} />
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="settings-display-name">Display name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="settings-display-name"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Your name"
                        disabled={isSavingName}
                        maxLength={80}
                      />
                      <Button
                        type="button"
                        onClick={handleSaveName}
                        disabled={!isNameDirty || isSavingName}
                      >
                        {isSavingName ? 'Saving…' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>

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
