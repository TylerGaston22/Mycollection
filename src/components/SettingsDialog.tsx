import { useState } from 'react';
import { Lock, Palette, Download, Upload, FileText, Info, ImageIcon, Film, Tv, UtensilsCrossed, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Movie } from "../types/movie";
import { CustomTab } from "../types/customTab";
import { CustomSection } from "../types/customSection";
import { toast } from "sonner@2.0.3";
import { FormatGuideDialog } from "./FormatGuideDialog";
import { colorThemes } from "../utils/themeConfig";

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
  const [isFormatGuideOpen, setIsFormatGuideOpen] = useState(false);

  // Convert colorThemes object to array
  const colorOptions = Object.values(colorThemes);

  const updateColor = (type: 'movie' | 'tv-show' | 'restaurant' | 'place', colorId: string) => {
    onBackgroundColorsChange({
      ...backgroundColors,
      [type]: colorId
    });
  };

  const ColorPicker = ({ 
    label, 
    icon: Icon, 
    type,
    selectedColor,
  }: { 
    label: string; 
    icon: any; 
    type: 'movie' | 'tv-show' | 'restaurant' | 'place';
    selectedColor: string; 
  }) => {
    // Get selected theme name
    let selectedThemeName = 'Custom';
    const foundColor = colorOptions.find(c => c.id === selectedColor);
    if (foundColor) {
      selectedThemeName = foundColor.name;
    }

    return (
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <Label>{label}</Label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((color) => {
            // Determine button className
            let buttonClassName = 'h-16 rounded-lg transition-all hover:scale-105 relative overflow-hidden';
            if (selectedColor === color.id) {
              buttonClassName = buttonClassName + ' ring-2 ring-orange-500 ring-offset-2 ring-offset-background';
            }

            return (
              <button
                key={color.id}
                onClick={() => updateColor(type, color.id)}
                className={buttonClassName}
                title={color.name}
              >
                {/* Split preview: left = sidebar, right = background */}
                <div className="absolute inset-0 flex">
                  <div 
                    className="w-1/2" 
                    style={{ background: color.sidebarGradient }}
                  />
                  <div 
                    className="w-1/2" 
                    style={{ background: color.backgroundGradient }}
                  />
                </div>
                {selectedColor === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Selected: {selectedThemeName}
        </p>
      </div>
    );
  };

  const handleExportData = () => {
    const exportMovies = movies || [];
    const exportCustomTabs = customTabs || [];
    const exportCustomSections = customSections || [];

    const data = {
      movies: exportMovies,
      customTabs: exportCustomTabs,
      customSections: exportCustomSections,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-collection-backup-${new Date().toISOString().split('T')[0]}.json`;
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
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        return;
      }
      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (!event.target) return;
          const data = JSON.parse(event.target.result as string);
          
          // Validate the data structure
          if (!data.movies || !Array.isArray(data.movies)) {
            throw new Error('Invalid data format: movies array not found');
          }

          // Call the import callback
          if (onImport) {
            const importMovies = data.movies || [];
            const importCustomTabs = data.customTabs || [];
            const importCustomSections = data.customSections || [];

            onImport({
              movies: importMovies,
              customTabs: importCustomTabs,
              customSections: importCustomSections
            });
          }

          const customTabsLength = data.customTabs && data.customTabs.length ? data.customTabs.length : 0;
          const customSectionsLength = data.customSections && data.customSections.length ? data.customSections.length : 0;

          toast.success('Collection imported successfully!', {
            description: `Imported ${data.movies.length} items, ${customTabsLength} custom categories, and ${customSectionsLength} custom sections.`
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

  const handleBulkImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        return;
      }
      const file = files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (!event.target) return;
          const content = event.target.result as string;
          const lines = content.trim().split('\n');
          
          if (lines.length < 2) {
            throw new Error('File must contain a header row and at least one data row');
          }

          // Parse header
          const header = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          // Validate required columns
          if (!header.includes('title') || !header.includes('type')) {
            throw new Error('CSV must include "Title" and "Type" columns');
          }

          // Parse data rows
          const newMovies: Movie[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: any = {};
            
            header.forEach((col, index) => {
              const value = values[index] || '';
              row[col] = value;
            });

            // Validate type
            const validTypes = ['movie', 'tv-show', 'restaurant', 'place'];
            if (!validTypes.includes(row.type)) {
              continue;
            }

            // Parse rating
            let ratingValue = undefined;
            if (row.rating) {
              ratingValue = parseInt(row.rating);
            }

            // Create movie object
            const movie: Movie = {
              id: `bulk-${Date.now()}-${i}`,
              title: row.title,
              type: row.type as 'movie' | 'tv-show' | 'restaurant' | 'place',
              status: row.status || 'want-to-see',
              favorite: false,
              platform: row.platform || undefined,
              genre: row.genre || undefined,
              rating: ratingValue,
              notes: row.notes || undefined,
            };

            newMovies.push(movie);
          }

          if (newMovies.length === 0) {
            throw new Error('No valid items found in file');
          }

          // Import the items
          if (onImport) {
            const existingMovies = movies || [];
            const existingCustomTabs = customTabs || [];
            const existingCustomSections = customSections || [];

            onImport({
              movies: [...existingMovies, ...newMovies],
              customTabs: existingCustomTabs,
              customSections: existingCustomSections
            });
          }

          toast.success('Bulk import successful!', {
            description: `Added ${newMovies.length} items to your collection.`
          });
          
          onOpenChange(false);
        } catch (error) {
          let errorMessage = 'The file format is invalid.';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          toast.error('Import failed', {
            description: errorMessage
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Calculate counts for display
  const moviesCount = movies && movies.length ? movies.length : 0;
  const customTabsCount = customTabs && customTabs.length ? customTabs.length : 0;
  const customSectionsCount = customSections && customSections.length ? customSections.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your app experience
          </DialogDescription>
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

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Tab Backgrounds
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize the background for each section
                </p>
              </div>

              {/* Movies Background */}
              <ColorPicker
                label="Movies Background"
                icon={Film}
                type="movie"
                selectedColor={backgroundColors.movie}
              />

              {/* TV Shows Background */}
              <ColorPicker
                label="TV Shows Background"
                icon={Tv}
                type="tv-show"
                selectedColor={backgroundColors['tv-show']}
              />

              {/* Restaurants Background */}
              <ColorPicker
                label="Restaurants Background"
                icon={UtensilsCrossed}
                type="restaurant"
                selectedColor={backgroundColors.restaurant}
              />

              {/* Places Background */}
              <ColorPicker
                label="Places Background"
                icon={MapPin}
                type="place"
                selectedColor={backgroundColors.place}
              />

            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <h4>Data Management</h4>
                <p className="text-sm text-muted-foreground mb-4">
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
                  Exported data includes: Movies ({moviesCount}), TV Shows, Restaurants, Places, Custom Categories ({customTabsCount}), and Custom Sections ({customSectionsCount}).
                </p>
                
                <Separator className="my-4" />
                
                {/* Bulk Import Section */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bulk Import from CSV/TXT
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Import multiple items at once using a CSV or TXT file.
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleBulkImport}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV/TXT
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFormatGuideOpen(true)}
                      title="View format guide"
                    >
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
      
      <FormatGuideDialog
        open={isFormatGuideOpen}
        onOpenChange={setIsFormatGuideOpen}
      />
    </Dialog>
  );
}