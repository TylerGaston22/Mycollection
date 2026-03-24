/**
 * useDataExportImport – shared data export/import logic.
 * Handles JSON backup export, JSON backup import, and CSV/TXT bulk import.
 * Used by both SettingsDialog and ProfileDialog to avoid duplicating
 * file I/O and parsing code.
 */

import { toast } from "sonner@2.0.3";
import { Movie, CustomTab, CustomSection } from '../types';

interface ExportOptions {
  movies: Movie[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
  filenamePrefix?: string;
  profileInfo?: { name: string; username: string; email: string };
}

interface ImportResult {
  movies: Movie[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
}

export function useDataExportImport() {
  // Creates a JSON blob, triggers a download via a temporary <a> element, then cleans up
  const exportData = ({ movies, customTabs, customSections, filenamePrefix = 'my-collection-backup', profileInfo }: ExportOptions) => {
    const collectionDataForExport: Record<string, unknown> = {
      movies,
      customTabs,
      customSections,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    if (profileInfo) {
      collectionDataForExport.profile = profileInfo;
    }

    const jsonFileBlob = new Blob([JSON.stringify(collectionDataForExport, null, 2)], { type: 'application/json' });
    const downloadableFileUrl = URL.createObjectURL(jsonFileBlob);
    const downloadLinkElement = document.createElement('a');
    downloadLinkElement.href = downloadableFileUrl;
    downloadLinkElement.download = `${filenamePrefix}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(downloadLinkElement);
    downloadLinkElement.click();
    document.body.removeChild(downloadLinkElement);
    URL.revokeObjectURL(downloadableFileUrl);
    toast.success('Collection exported successfully!', { description: 'Your data has been downloaded as a JSON file.' });
  };

  // Opens a file picker for .json files, parses the contents, and calls onImport with the result
  const importData = (onImport: (data: ImportResult) => void, onComplete?: () => void) => {
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
          onImport({
            movies: parsedData.movies || [],
            customTabs: parsedData.customTabs || [],
            customSections: parsedData.customSections || [],
          });
          toast.success('Collection imported successfully!', {
            description: `Imported ${parsedData.movies.length} items, ${parsedData.customTabs?.length || 0} custom categories, and ${parsedData.customSections?.length || 0} custom sections.`,
          });
          onComplete?.();
        } catch {
          toast.error('Import failed', { description: 'The file format is invalid. Please make sure you\'re importing a valid collection backup file.' });
        }
      };
      fileContentReader.readAsText(file);
    };
    hiddenFileInputElement.click();
  };

  // Opens a file picker for .csv/.txt, parses rows into Movie objects, and merges with existing data
  const bulkImportCsv = (existingMovies: Movie[], onImport: (data: ImportResult) => void, existingTabs: CustomTab[], existingSections: CustomSection[], onComplete?: () => void) => {
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
            const parsedCsvRow: Record<string, string> = {};
            csvColumnHeaders.forEach((columnName, columnIndex) => {
              parsedCsvRow[columnName] = columnValues[columnIndex] || '';
            });

            if (!['movie', 'tv-show', 'restaurant', 'place'].includes(parsedCsvRow.type)) continue;

            newMovies.push({
              id: `bulk-${Date.now()}-${lineIndex}`,
              title: parsedCsvRow.title,
              type: parsedCsvRow.type,
              status: (parsedCsvRow.status as 'watched' | 'want-to-see') || 'want-to-see',
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

          onImport({
            movies: [...existingMovies, ...newMovies],
            customTabs: existingTabs,
            customSections: existingSections,
          });
          toast.success('Bulk import successful!', { description: `Added ${newMovies.length} items to your collection.` });
          onComplete?.();
        } catch (error) {
          toast.error('Import failed', { description: error instanceof Error ? error.message : 'The file format is invalid.' });
        }
      };
      fileContentReader.readAsText(file);
    };
    hiddenFileInputElement.click();
  };

  return { exportData, importData, bulkImportCsv };
}
