/**
 * QuickEditDialog – lightweight inline edit dialog for a single field.
 * Opens when the user clicks a platform, genre, or notes cell in the
 * ListView. Uses a text input for platform/genre and a textarea for notes.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Movie } from "../types";

interface QuickEditDialogProps {
  movie: Movie | null;
  field: 'platform' | 'genre' | 'notes' | null;
  onSave: (movieId: string, field: string, value: string | undefined) => void;
  onClose: () => void;
}

const FIELD_CONFIG = {
  platform: { title: 'Edit Where to Watch', label: 'Platform', placeholder: 'e.g., Netflix, Hulu, Disney+' },
  genre: { title: 'Edit Genre', label: 'Genre', placeholder: 'e.g., Action, Comedy, Drama' },
  notes: { title: 'Edit Notes', label: 'Notes', placeholder: '' },
};

export function QuickEditDialog({ movie, field, onSave, onClose }: QuickEditDialogProps) {
  const [currentEditFieldValue, setCurrentEditFieldValue] = useState('');

  useEffect(() => {
    if (!movie || !field) return;
    if (field === 'notes') {
      setCurrentEditFieldValue(movie.notes || '');
    } else if (field === 'platform') {
      setCurrentEditFieldValue(movie.platform || '');
    } else {
      setCurrentEditFieldValue(movie.genre || '');
    }
  }, [movie, field]);

  if (!movie || !field) return null;

  const config = FIELD_CONFIG[field];

  const handleSave = () => {
    onSave(movie.id, field, currentEditFieldValue || undefined);
    onClose();
  };

  let quickEditInput;
  if (field === 'notes') {
    quickEditInput = (
      <Textarea
        id="qe-field"
        value={currentEditFieldValue}
        onChange={(e) => setCurrentEditFieldValue(e.target.value)}
        placeholder="Add your notes here..."
        rows={4}
        autoFocus
      />
    );
  } else {
    quickEditInput = (
      <Input
        id="qe-field"
        value={currentEditFieldValue}
        onChange={(e) => setCurrentEditFieldValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } }}
        placeholder={config.placeholder}
        autoFocus
      />
    );
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="qe-field">{config.label}</Label>
          {quickEditInput}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
