/**
 * AddSectionDialog – modal form for creating a new subcategory.
 * Accepts a content type and delegates the new section back to the
 * parent via the onAdd callback. Resets its form state on submission.
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { CustomSection } from "../types";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (section: Omit<CustomSection, 'id'>) => void;
  contentType: string;
}

export function AddSectionDialog({ open, onOpenChange, onAdd, contentType }: AddSectionDialogProps) {
  const [subcategoryName, setSubcategoryName] = useState('');

  let contentTypePluralName;
  if (contentType === 'movie') {
    contentTypePluralName = 'movies';
  } else if (contentType === 'tv-show') {
    contentTypePluralName = 'TV shows';
  } else if (contentType === 'restaurant') {
    contentTypePluralName = 'restaurants';
  } else if (contentType === 'place') {
    contentTypePluralName = 'places';
  } else {
    contentTypePluralName = 'items';
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!subcategoryName.trim()) return;

    onAdd({
      name: subcategoryName.trim(),
      contentType,
    });

    // Reset form
    setSubcategoryName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Subcategory</DialogTitle>
            <DialogDescription>
              Add a custom subcategory to organize your {contentTypePluralName}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="space-y-2">
              <Label htmlFor="section-name">Subcategory Name</Label>
              <Input
                id="section-name"
                value={subcategoryName}
                onChange={(event) => setSubcategoryName(event.target.value)}
                placeholder="e.g., Top Ten, Must Watch Soon, Action, Classics..."
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                Examples: "Top 10", "Oscar Winners", "Date Night", "Comfort Food"
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!subcategoryName.trim()}>
              Create Subcategory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
