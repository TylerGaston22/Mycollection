/**
 * QuickEditDialog – lightweight inline edit dialog for a single field.
 * Opens when the user clicks a platform, genre, or notes cell in the
 * ListView, and on a mobile long-press. Uses a text input for
 * platform/genre; notes get the full NotesField so a screenshot can be
 * pasted here too, not just in the Add/Edit dialog.
 *
 * onSave hands back a Partial<Item> rather than a field/value pair
 * because the notes case writes two fields at once (the text and its
 * attached images).
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { NotesField } from "../notes";
import { Item } from "../../types";
import { getContentTypeFieldConfig } from "../../utils/contentHelpers";

interface QuickEditDialogProps {
  item: Item | null;
  field: 'platform' | 'genre' | 'notes' | null;
  onSave: (itemId: string, updates: Partial<Item>) => void;
  onClose: () => void;
}

const STATIC_FIELD_CONFIG = {
  genre: { title: 'Edit Genre', label: 'Genre', placeholder: 'e.g., Action, Comedy, Drama' },
  notes: { title: 'Edit Notes', label: 'Notes', placeholder: '' },
};

export function QuickEditDialog({ item, field, onSave, onClose }: QuickEditDialogProps) {
  const [currentEditFieldValue, setCurrentEditFieldValue] = useState('');
  const [noteImages, setNoteImages] = useState<string[]>([]);

  useEffect(() => {
    if (!item || !field) return;
    if (field === 'notes') {
      setCurrentEditFieldValue(item.notes || '');
      setNoteImages(item.noteImages || []);
    } else if (field === 'platform') {
      setCurrentEditFieldValue(item.platform || '');
    } else {
      setCurrentEditFieldValue(item.genre || '');
    }
  }, [item, field]);

  if (!item || !field) return null;

  // Platform's labels depend on the item's content type (Where to Watch /
  // Cuisine Type / Location / Additional Info); the others are fixed.
  let config: { title: string; label: string; placeholder: string };
  if (field === 'platform') {
    const fieldConfig = getContentTypeFieldConfig(item.type);
    config = {
      title: `Edit ${fieldConfig.platformFieldLabel}`,
      label: fieldConfig.platformFieldLabel,
      placeholder: fieldConfig.platformFieldPlaceholder,
    };
  } else {
    config = STATIC_FIELD_CONFIG[field];
  }

  const handleSave = () => {
    if (field === 'notes') {
      // noteImages goes over unconditionally so removing the last image
      // actually clears the column — an omitted key wouldn't.
      onSave(item.id, { notes: currentEditFieldValue || undefined, noteImages });
    } else {
      // Pass undefined instead of empty string so the field is cleared in the data model
      onSave(item.id, { [field]: currentEditFieldValue || undefined });
    }
    onClose();
  };

  let quickEditInput;
  if (field === 'notes') {
    quickEditInput = (
      <NotesField
        id="qe-field"
        value={currentEditFieldValue}
        onChange={setCurrentEditFieldValue}
        images={noteImages}
        onImagesChange={setNoteImages}
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
        onChange={(event) => setCurrentEditFieldValue(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleSave(); } }} // Enter-to-save for single-line inputs
        placeholder={config.placeholder}
        autoFocus
      />
    );
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose(); }}>
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
