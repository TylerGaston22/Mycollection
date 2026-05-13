/**
 * useDataExportImport – shared data export/import logic.
 * Handles JSON backup export, JSON backup import, and CSV/TXT bulk import.
 * Used by both SettingsDialog and ProfileDialog to avoid duplicating
 * file I/O and parsing code.
 */

import { toast } from "sonner@2.0.3";
import { Item, CustomTab, CustomSection } from '../types';
import { validateItem, validateCustomTab, validateCustomSection } from '../utils/sanitize';
import { parseCsvIntoItems, serializeItemsToCsv } from '../utils/csv';

interface ExportOptions {
  items: Item[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
  filenamePrefix?: string;
  profileInfo?: { name: string; username: string; email: string };
}

interface ImportResult {
  items: Item[];
  customTabs: CustomTab[];
  customSections: CustomSection[];
}

export function useDataExportImport() {
  // Creates a JSON blob, triggers a download via a temporary <a> element, then cleans up
  const exportData = ({ items, customTabs, customSections, filenamePrefix = 'my-collection-backup', profileInfo }: ExportOptions) => {
    const collectionDataForExport: Record<string, unknown> = {
      items,
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

  // Opens a file picker for .json files, validates and sanitizes, then calls onImport
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
          if (!parsedData.items || !Array.isArray(parsedData.items)) {
            throw new Error('Invalid data format: items array not found');
          }

          // Validate and sanitize each item individually
          const validItems = (parsedData.items as unknown[])
            .map(validateItem)
            .filter((item): item is Item => item !== null);

          const validTabs = Array.isArray(parsedData.customTabs)
            ? (parsedData.customTabs as unknown[])
                .map(validateCustomTab)
                .filter((item): item is CustomTab => item !== null)
            : [];

          const validSections = Array.isArray(parsedData.customSections)
            ? (parsedData.customSections as unknown[])
                .map(validateCustomSection)
                .filter((item): item is CustomSection => item !== null)
            : [];

          const skippedCount = parsedData.items.length - validItems.length;

          onImport({
            items: validItems,
            customTabs: validTabs,
            customSections: validSections,
          });

          let description = `Imported ${validItems.length} items, ${validTabs.length} custom categories, and ${validSections.length} custom sections.`;
          if (skippedCount > 0) {
            description += ` Skipped ${skippedCount} invalid items.`;
          }
          toast.success('Collection imported successfully!', { description });
          onComplete?.();
        } catch {
          toast.error('Import failed', { description: 'The file format is invalid. Please make sure you\'re importing a valid collection backup file.' });
        }
      };
      fileContentReader.readAsText(file);
    };
    hiddenFileInputElement.click();
  };

  // Opens a file picker for .csv/.txt, parses rows into Item objects, and merges with existing data
  const bulkImportCsv = (existingItems: Item[], onImport: (data: ImportResult) => void, existingTabs: CustomTab[], existingSections: CustomSection[], onComplete?: () => void) => {
    const hiddenFileInputElement = document.createElement('input');
    hiddenFileInputElement.type = 'file';
    hiddenFileInputElement.accept = '.csv,.txt';
    hiddenFileInputElement.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const fileContentReader = new FileReader();
      fileContentReader.onload = (readerEvent) => {
        try {
          const newItems = parseCsvIntoItems(readerEvent.target?.result as string);
          onImport({
            items: [...existingItems, ...newItems],
            customTabs: existingTabs,
            customSections: existingSections,
          });
          toast.success('Bulk import successful!', { description: `Added ${newItems.length} items to your collection.` });
          onComplete?.();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'The file format is invalid.';
          toast.error('Import failed', { description: message });
        }
      };
      fileContentReader.readAsText(file);
    };
    hiddenFileInputElement.click();
  };

  // Exports items as a CSV file with standard column headers
  const exportCsv = (items: Item[]) => {
    const csvBlob = new Blob([serializeItemsToCsv(items)], { type: 'text/csv' });
    const downloadUrl = URL.createObjectURL(csvBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = `my-collection-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUrl);
    toast.success('Collection exported!', { description: `Downloaded ${items.length} items as CSV.` });
  };

  return { exportData, importData, bulkImportCsv, exportCsv };
}
