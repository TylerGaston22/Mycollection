import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Palette, Trash2 } from 'lucide-react';

interface CustomColorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryType: 'movie' | 'tv-show' | 'restaurant' | 'place';
  onSave: (colors: {
    sidebarColor: string;
    backgroundGradientColor: string;
    accentColor: string;
  }) => void;
  onDelete?: () => void;
  initialColors?: {
    sidebarColor: string;
    backgroundGradientColor: string;
    accentColor: string;
  };
  isEditingExisting?: boolean;
}

export function CustomColorPickerDialog({
  open,
  onOpenChange,
  categoryType,
  onSave,
  onDelete,
  initialColors,
  isEditingExisting = false
}: CustomColorPickerDialogProps) {
  const [sidebarColor, setSidebarColor] = useState(initialColors?.sidebarColor || '#7c2d87');
  const [backgroundGradientColor, setBackgroundGradientColor] = useState(initialColors?.backgroundGradientColor || '#3b0764');
  const [accentColor, setAccentColor] = useState(initialColors?.accentColor || '#f97316');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave({
      sidebarColor,
      backgroundGradientColor,
      accentColor
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onOpenChange(false);
      setShowDeleteConfirm(false);
    }
  };

  const categoryLabels = {
    'movie': 'Movies',
    'tv-show': 'TV Shows',
    'restaurant': 'Restaurants',
    'place': 'Places'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {isEditingExisting ? 'Edit Custom Colors' : 'Custom Colors'} - {categoryLabels[categoryType]}
          </DialogTitle>
          <DialogDescription>
            {isEditingExisting 
              ? `Edit your custom color theme for ${categoryLabels[categoryType].toLowerCase()}`
              : `Create your own custom color theme for ${categoryLabels[categoryType].toLowerCase()}`
            }
          </DialogDescription>
        </DialogHeader>

        {showDeleteConfirm ? (
          <div className="py-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Delete Custom Theme?</h3>
                <p className="text-sm text-muted-foreground">
                  This will delete your custom color scheme for {categoryLabels[categoryType].toLowerCase()} and revert to the default "Current (Ghibli)" theme.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Theme
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6 py-4">
              {/* Sidebar Color */}
              <div className="space-y-3">
                <Label htmlFor="sidebar-color">Sidebar Color</Label>
                <p className="text-sm text-muted-foreground">
                  Main color for the sidebar background
                </p>
                <div className="flex gap-3 items-center">
                  <input
                    id="sidebar-color"
                    type="color"
                    value={sidebarColor}
                    onChange={(e) => setSidebarColor(e.target.value)}
                    className="h-12 w-20 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={sidebarColor}
                    onChange={(e) => setSidebarColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border bg-background"
                    placeholder="#7c2d87"
                  />
                </div>
              </div>

              {/* Background Gradient Color */}
              <div className="space-y-3">
                <Label htmlFor="bg-gradient-color">Background Gradient Color</Label>
                <p className="text-sm text-muted-foreground">
                  The color the background transitions into (like the dark black transition)
                </p>
                <div className="flex gap-3 items-center">
                  <input
                    id="bg-gradient-color"
                    type="color"
                    value={backgroundGradientColor}
                    onChange={(e) => setBackgroundGradientColor(e.target.value)}
                    className="h-12 w-20 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundGradientColor}
                    onChange={(e) => setBackgroundGradientColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border bg-background"
                    placeholder="#3b0764"
                  />
                </div>
              </div>

              {/* Accent/Button Color */}
              <div className="space-y-3">
                <Label htmlFor="accent-color">Button & Accent Color</Label>
                <p className="text-sm text-muted-foreground">
                  Color for buttons, highlights, and active states
                </p>
                <div className="flex gap-3 items-center">
                  <input
                    id="accent-color"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-12 w-20 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded border bg-background"
                    placeholder="#f97316"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <Label>Preview</Label>
                <div className="h-24 rounded-lg overflow-hidden flex border">
                  <div 
                    className="w-1/2 flex items-center justify-center text-white font-medium"
                    style={{ 
                      background: `linear-gradient(to bottom, ${sidebarColor}, ${sidebarColor}dd, ${sidebarColor})` 
                    }}
                  >
                    Sidebar
                  </div>
                  <div 
                    className="w-1/2 flex items-center justify-center relative"
                    style={{ 
                      background: `linear-gradient(to bottom right, ${sidebarColor}, ${backgroundGradientColor}, #000000)` 
                    }}
                  >
                    <div 
                      className="px-4 py-2 rounded font-medium text-white shadow-lg"
                      style={{ backgroundColor: accentColor }}
                    >
                      Button
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between">
              <div>
                {isEditingExisting && onDelete && (
                  <Button 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {isEditingExisting ? 'Save Changes' : 'Save Custom Colors'}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}