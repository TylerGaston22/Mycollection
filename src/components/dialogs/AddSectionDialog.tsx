/**
 * AddSectionDialog – modal form for creating a new subcategory.
 * Accepts a content type and delegates the new section back to the
 * parent via the onAdd callback.
 *
 * Awaits onAdd and only closes/resets on success, so a failed insert
 * leaves the dialog open with the typed name intact instead of
 * silently vanishing. Same contract AddTabDialog uses (todo J/V).
 */
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ThemePrimaryButton } from "../ui/ThemePrimaryButton";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { CustomSection } from "../../types";
import { ThemeConfig } from "../../utils/themeConfig";

interface AddSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resolves to true on a successful insert; false (or undefined for
   *  back-compat) keeps the dialog open so the user sees the failure
   *  toast and can retry without retyping. */
  onAdd: (section: Omit<CustomSection, 'id'>) => Promise<boolean> | void;
  contentType: string;
  currentTheme?: ThemeConfig;
}

export function AddSectionDialog({ open, onOpenChange, onAdd, contentType, currentTheme }: AddSectionDialogProps) {
  const [subcategoryName, setSubcategoryName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  let contentTypePluralName;
  if (contentType === 'item') {
    contentTypePluralName = 'items';
  } else if (contentType === 'tv-show') {
    contentTypePluralName = 'TV shows';
  } else if (contentType === 'restaurant') {
    contentTypePluralName = 'restaurants';
  } else if (contentType === 'place') {
    contentTypePluralName = 'places';
  } else {
    contentTypePluralName = 'items';
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subcategoryName.trim()) return;

    // Await onAdd rather than firing and closing: the insert can fail
    // (RLS gap, network) and the dialog should stay open with the typed
    // name intact so the user can retry. try/finally so a thrown error
    // can't strand isSaving at true and freeze the button — see
    // docs/errors.md for the Add Category version of exactly that.
    setIsSaving(true);
    let result: boolean | void;
    try {
      result = await onAdd({
        name: subcategoryName.trim(),
        contentType,
      });
    } catch (error) {
      let description = 'Something went wrong. Please try again.';
      if (error instanceof Error) description = error.message;
      toast.error('Failed to create subcategory', { description });
      return;
    } finally {
      setIsSaving(false);
    }

    // Treat undefined as legacy "success"; false explicitly means failure.
    if (result === false) return;

    // Reset form
    setSubcategoryName('');
    onOpenChange(false);
  };

  // if/else over a ternary, even inline in JSX (coding-standards §6).
  let submitLabel = 'Create Subcategory';
  if (isSaving) {
    submitLabel = 'Creating…';
  }

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
            <ThemePrimaryButton
              type="submit"
              disabled={!subcategoryName.trim() || isSaving}
              currentTheme={currentTheme}
            >
              {submitLabel}
            </ThemePrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
