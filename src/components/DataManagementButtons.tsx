/**
 * DataManagementButtons – export/import button pair for collection data.
 * Renders a 2-column grid with Download and Upload buttons.
 * Used by both ProfileDialog and SettingsDialog.
 */

import { Download, Upload } from 'lucide-react';
import { Button } from "./ui/button";

interface DataManagementButtonsProps {
  onExport: () => void;
  onImport: () => void;
}

export function DataManagementButtons({ onExport, onImport }: DataManagementButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={onExport}>
        <Download className="h-5 w-5" />
        <div className="text-center">
          <div className="font-medium">Export</div>
          <div className="text-xs text-muted-foreground">Download as CSV</div>
        </div>
      </Button>
      <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={onImport}>
        <Upload className="h-5 w-5" />
        <div className="text-center">
          <div className="font-medium">Import</div>
          <div className="text-xs text-muted-foreground">Upload CSV/TXT</div>
        </div>
      </Button>
    </div>
  );
}
