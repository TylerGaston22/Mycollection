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
import { CustomSection } from "../types/customSection";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (section: Omit<CustomSection, 'id'>) => void;
  contentType: string;
}

export function AddSectionDialog({ open, onOpenChange, onAdd, contentType }: AddSectionDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      contentType,
    });

    // Reset form
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Subcategory</DialogTitle>
            <DialogDescription>
              Add a custom subcategory to organize your {contentType === 'movie' ? 'movies' : contentType === 'tv-show' ? 'TV shows' : contentType === 'restaurant' ? 'restaurants' : contentType === 'place' ? 'places' : 'items'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="space-y-2">
              <Label htmlFor="section-name">Subcategory Name</Label>
              <Input
                id="section-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            <Button type="submit" disabled={!name.trim()}>
              Create Subcategory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}