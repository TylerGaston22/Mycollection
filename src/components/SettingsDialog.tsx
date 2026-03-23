import { useState } from 'react';
import { Lock, Palette, Download, Upload, FileText, Info, ImageIcon, Film, Tv, UtensilsCrossed, MapPin, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Movie, CustomTab, CustomSection } from "../types";
import { toast } from "sonner@2.0.3";
import { colorThemes } from "../utils/themeConfig";

const FORMAT_EXAMPLE = `Title,Type,Platform,Genre,Status,Rating,Notes
My Favorite Movie,movie,Netflix,Drama,watched,5,An all-time favorite
A Show I Want to Watch,tv-show,Max,Comedy,want-to-see,,
A Restaurant I Love,restaurant,,Italian,visited,4,Great pasta
A City to Visit,place,,,want-to-visit,,Dream trip`;

const AI_PROMPT_CSV = `Please format my list into this exact CSV format:

Title,Type,Platform,Genre,Status,Rating,Notes

Requirements:
- Type must be: movie, tv-show, restaurant, or place
- Status options: watched, want-to-see, visited, want-to-visit
- Rating: 1-5 (only for watched/visited items)
- Use commas to separate fields
- Wrap text in quotes if it contains commas
- Leave empty fields blank but keep the commas

Here's my list:
[PASTE YOUR LIST HERE]`;

const AI_PROMPT_TXT = `Please format my list into this exact TXT format with one item per line:

Title | Type | Platform | Genre | Status | Rating | Notes

Requirements:
- Type must be: movie, tv-show, restaurant, or place
- Status options: watched, want-to-see, visited, want-to-visit
- Rating: 1-5 (only for watched/visited items)
- Use | (pipe) to separate fields
- Leave empty fields blank but keep the pipes

Here's my list:
[PASTE YOUR LIST HERE]`;

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
  const [hasRecentlyCopiedFormat, setHasRecentlyCopiedFormat] = useState(false);
  const [recentlyCopiedPromptType, setRecentlyCopiedPromptType] = useState<'csv' | 'txt' | null>(null);

  const availableColorThemeOptions = Object.values(colorThemes);

  const updateColor = (type: 'movie' | 'tv-show' | 'restaurant' | 'place', colorId: string) => {
    onBackgroundColorsChange({ ...backgroundColors, [type]: colorId });
  };

  const copyToClipboard = (textToCopy: string) => {
    const hiddenTextarea = document.createElement('textarea');
    hiddenTextarea.value = textToCopy;
    hiddenTextarea.style.position = 'fixed';
    hiddenTextarea.style.opacity = '0';
    document.body.appendChild(hiddenTextarea);
    hiddenTextarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(hiddenTextarea);
    }
  };

  const handleCopyFormat = () => {
    if (copyToClipboard(FORMAT_EXAMPLE)) {
      setHasRecentlyCopiedFormat(true);
      toast.success('Format copied to clipboard!');
      setTimeout(() => setHasRecentlyCopiedFormat(false), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyPrompt = (promptType: 'csv' | 'txt') => {
    let promptTextToCopy;
    if (promptType === 'csv') {
      promptTextToCopy = AI_PROMPT_CSV;
    } else {
      promptTextToCopy = AI_PROMPT_TXT;
    }

    if (copyToClipboard(promptTextToCopy)) {
      setRecentlyCopiedPromptType(promptType);
      toast.success('AI Prompt copied to clipboard!');
      setTimeout(() => setRecentlyCopiedPromptType(null), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
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
    const matchingColorTheme = availableColorThemeOptions.find((colorTheme) => colorTheme.id === selectedColor);
    const selectedColorThemeName = matchingColorTheme?.name ?? 'Custom';

    return (
      <div className="space-y-3 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <Label>{label}</Label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {availableColorThemeOptions.map((colorTheme) => {
            let colorButtonClassName = 'h-16 rounded-lg transition-all hover:scale-105 relative overflow-hidden';
            if (selectedColor === colorTheme.id) {
              colorButtonClassName += ' ring-2 ring-orange-500 ring-offset-2 ring-offset-background';
            }
            return (
              <button
                key={colorTheme.id}
                onClick={() => updateColor(type, colorTheme.id)}
                className={colorButtonClassName}
                title={colorTheme.name}
              >
                <div className="absolute inset-0 flex">
                  <div className="w-1/2" style={{ background: colorTheme.sidebarGradient }} />
                  <div className="w-1/2" style={{ background: colorTheme.backgroundGradient }} />
                </div>
                {selectedColor === colorTheme.id && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">Selected: {selectedColorThemeName}</p>
      </div>
    );
  };

  const handleExportData = () => {
    const collectionDataForExport = {
      movies: movies || [],
      customTabs: customTabs || [],
      customSections: customSections || [],
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const jsonFileBlob = new Blob([JSON.stringify(collectionDataForExport, null, 2)], { type: 'application/json' });
    const downloadableFileUrl = URL.createObjectURL(jsonFileBlob);
    const downloadLinkElement = document.createElement('a');
    downloadLinkElement.href = downloadableFileUrl;
    downloadLinkElement.download = `my-collection-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(downloadLinkElement);
    downloadLinkElement.click();
    document.body.removeChild(downloadLinkElement);
    URL.revokeObjectURL(downloadableFileUrl);
    toast.success('Collection exported successfully!', { description: 'Your data has been downloaded as a JSON file.' });
  };

  const handleImportData = () => {
    const hiddenFileInputElement = document.createElement('input');
    hiddenFileInputElement.type = 'file';
    hiddenFileInputElement.accept = '.json';
    hiddenFileInputElement.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const fileContentReader = new FileReader();
      fileContentReader.onload = (readerEvent) => {
        try {
          const parsedData = JSON.parse(readerEvent.target?.result as string);
          if (!parsedData.movies || !Array.isArray(parsedData.movies)) {
            throw new Error('Invalid data format: movies array not found');
          }
          onImport?.({
            movies: parsedData.movies || [],
            customTabs: parsedData.customTabs || [],
            customSections: parsedData.customSections || []
          });
          toast.success('Collection imported successfully!', {
            description: `Imported ${parsedData.movies.length} items, ${parsedData.customTabs?.length || 0} custom categories, and ${parsedData.customSections?.length || 0} custom sections.`
          });
          onOpenChange(false);
        } catch (error) {
          toast.error('Import failed', { description: 'The file format is invalid. Please make sure you\'re importing a valid collection backup file.' });
        }
      };
      fileContentReader.readAsText(file);
    };
    hiddenFileInputElement.click();
  };

  const handleBulkImport = () => {
    const hiddenFileInputElement = document.createElement('input');
    hiddenFileInputElement.type = 'file';
    hiddenFileInputElement.accept = '.csv,.txt';
    hiddenFileInputElement.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const fileContentReader = new FileReader();
      fileContentReader.onload = (readerEvent) => {
        try {
          const fileContentText = readerEvent.target?.result as string;
          const allFileLines = fileContentText.trim().split('\n');
          if (allFileLines.length < 2) {
            throw new Error('File must contain a header row and at least one data row');
          }

          const csvColumnHeaders = allFileLines[0].split(',').map((headerText) => headerText.trim().toLowerCase());
          if (!csvColumnHeaders.includes('title') || !csvColumnHeaders.includes('type')) {
            throw new Error('CSV must include "Title" and "Type" columns');
          }

          const newMovies: Movie[] = [];
          for (let lineIndex = 1; lineIndex < allFileLines.length; lineIndex++) {
            const currentLine = allFileLines[lineIndex].trim();
            if (!currentLine) continue;
            const columnValues = currentLine.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
            const parsedCsvRow: any = {};
            csvColumnHeaders.forEach((columnName, columnIndex) => {
              parsedCsvRow[columnName] = columnValues[columnIndex] || '';
            });

            if (!['movie', 'tv-show', 'restaurant', 'place'].includes(parsedCsvRow.type)) continue;

            newMovies.push({
              id: `bulk-${Date.now()}-${lineIndex}`,
              title: parsedCsvRow.title,
              type: parsedCsvRow.type,
              status: parsedCsvRow.status || 'want-to-see',
              favorite: false,
              platform: parsedCsvRow.platform || undefined,
              genre: parsedCsvRow.genre || undefined,
              rating: parsedCsvRow.rating ? parseInt(parsedCsvRow.rating) : undefined,
              notes: parsedCsvRow.notes || undefined,
            });
          }

          if (newMovies.length === 0) {
            throw new Error('No valid items found in file');
          }

          onImport?.({
            movies: [...(movies || []), ...newMovies],
            customTabs: customTabs || [],
            customSections: customSections || []
          });
          toast.success('Bulk import successful!', { description: `Added ${newMovies.length} items to your collection.` });
          onOpenChange(false);
        } catch (error) {
          toast.error('Import failed', { description: error instanceof Error ? error.message : 'The file format is invalid.' });
        }
      };
      fileContentReader.readAsText(file);
    };
    hiddenFileInputElement.click();
  };

  const totalMoviesCount = movies?.length ?? 0;
  const totalCustomTabsCount = customTabs?.length ?? 0;
  const totalCustomSectionsCount = customSections?.length ?? 0;

  let copyFormatButtonContent;
  if (hasRecentlyCopiedFormat) {
    copyFormatButtonContent = <><Check className="h-4 w-4" />Copied!</>;
  } else {
    copyFormatButtonContent = <><Copy className="h-4 w-4" />Copy Format</>;
  }

  let copyCsvPromptButtonContent;
  if (recentlyCopiedPromptType === 'csv') {
    copyCsvPromptButtonContent = <><Check className="h-4 w-4" />Copied!</>;
  } else {
    copyCsvPromptButtonContent = <><Copy className="h-4 w-4" />Copy CSV Prompt</>;
  }

  let copyTxtPromptButtonContent;
  if (recentlyCopiedPromptType === 'txt') {
    copyTxtPromptButtonContent = <><Check className="h-4 w-4" />Copied!</>;
  } else {
    copyTxtPromptButtonContent = <><Copy className="h-4 w-4" />Copy TXT Prompt</>;
  }

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
                <ColorPicker label="Movies Background" icon={Film} type="movie" selectedColor={backgroundColors.movie} />
                <ColorPicker label="TV Shows Background" icon={Tv} type="tv-show" selectedColor={backgroundColors['tv-show']} />
                <ColorPicker label="Restaurants Background" icon={UtensilsCrossed} type="restaurant" selectedColor={backgroundColors.restaurant} />
                <ColorPicker label="Places Background" icon={MapPin} type="place" selectedColor={backgroundColors.place} />
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4>Data Management</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your collection to backup your data or import a previously saved collection.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={handleExportData}>
                      <Download className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Export</div>
                        <div className="text-xs text-muted-foreground">Download backup</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={handleImportData}>
                      <Upload className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Import</div>
                        <div className="text-xs text-muted-foreground">Restore backup</div>
                      </div>
                    </Button>
                  </div>
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

      {/* Format Guide Dialog */}
      <Dialog open={isFormatGuideDialogOpen} onOpenChange={setIsFormatGuideDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CSV/TXT Format Guide</DialogTitle>
            <DialogDescription>
              Use this format for bulk importing items. You can copy this format and paste it into AI tools like ChatGPT to help format your list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Required Format:</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p className="font-mono">Title,Type,Platform,Genre,Status,Rating,Notes</p>
                <div className="space-y-1 text-muted-foreground">
                  <p>• <strong>Title</strong>: Name of the item (required)</p>
                  <p>• <strong>Type</strong>: movie, tv-show, restaurant, or place (required)</p>
                  <p>• <strong>Platform</strong>: Where to watch/find it (optional)</p>
                  <p>• <strong>Genre</strong>: Category or type (optional)</p>
                  <p>• <strong>Status</strong>: watched, want-to-see, visited, or want-to-visit (optional)</p>
                  <p>• <strong>Rating</strong>: Number from 1-5 (optional)</p>
                  <p>• <strong>Notes</strong>: Any additional notes (optional)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Example CSV:</h4>
                <Button size="sm" variant="outline" onClick={handleCopyFormat} className="gap-2">
                  {copyFormatButtonContent}
                </Button>
              </div>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre className="whitespace-pre">{FORMAT_EXAMPLE}</pre>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">💡 Pro Tip: Use AI to Format Your List</h4>
              <p className="text-sm text-muted-foreground">
                Copy the format above and paste it into ChatGPT or Claude along with your list of movies/shows/places.
              </p>
              <div className="bg-white dark:bg-slate-900 p-3 rounded text-sm italic border">
                "Please format my list according to this CSV format: [paste format here]. Here's my list: [paste your list]"
              </div>
              <div className="flex items-center justify-between mt-2">
                <Button size="sm" variant="outline" onClick={() => handleCopyPrompt('csv')} className="gap-2">
                  {copyCsvPromptButtonContent}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCopyPrompt('txt')} className="gap-2">
                  {copyTxtPromptButtonContent}
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground border-l-4 border-orange-500 pl-4">
              <p><strong>Important:</strong></p>
              <ul className="space-y-1 list-disc list-inside">
                <li>First row must be the header (column names)</li>
                <li>Use commas to separate fields</li>
                <li>Wrap text in quotes if it contains commas</li>
                <li>Both .csv and .txt files are accepted</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
