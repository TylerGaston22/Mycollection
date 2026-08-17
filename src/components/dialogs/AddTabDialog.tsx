/**
 * AddTabDialog – modal form for creating a custom sidebar tab.
 * Lets the user pick a name and an icon from a curated set of
 * Lucide icons, then delegates the new tab back via onAdd.
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
import { CustomTab } from "../../types";
import { ThemeConfig, colorToRgba } from "../../utils/themeConfig";
import { TAB_ICONS, DEFAULT_TAB_ICON_NAME } from "../../utils/tabIcons";

interface AddTabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resolves to true on a successful insert; false (or undefined for
   *  back-compat) keeps the dialog open so the user sees the failure
   *  toast and can correct the input. */
  onAdd: (tab: Omit<CustomTab, 'id'>) => Promise<boolean> | void;
  currentTheme?: ThemeConfig;
}

export function AddTabDialog({ open, onOpenChange, onAdd, currentTheme }: AddTabDialogProps) {
  const [categoryTabName, setCategoryTabName] = useState('');
  const [selectedCategoryIconName, setSelectedCategoryIconName] = useState(DEFAULT_TAB_ICON_NAME);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryTabName.trim()) return;

    // Await onAdd so we can keep the dialog open on failure (e.g. RLS
    // gap, network error). Same pattern as ItemFormDialog post-O.
    //
    // The try/finally is load-bearing, not defensive habit: onAdd goes
    // out to Supabase, and anything that *throws* rather than returning
    // an error used to skip setIsSaving(false) entirely — freezing the
    // button on "Creating…" forever, with no toast and no way to retry
    // short of reloading the page.
    setIsSaving(true);
    let result: boolean | void;
    try {
      result = await onAdd({
        name: categoryTabName.trim(),
        icon: selectedCategoryIconName,
      });
    } catch (error) {
      // handleSupabaseError only sees errors Supabase *returns*. A
      // thrown one (dropped connection, aborted fetch, a null row that
      // blows up on property access) lands here instead.
      let description = 'Something went wrong. Please try again.';
      if (error instanceof Error) description = error.message;
      toast.error('Failed to create tab', { description });
      return;
    } finally {
      setIsSaving(false);
    }

    // Treat undefined as legacy "success"; false explicitly means failure.
    if (result === false) return;

    // Reset form on success.
    setCategoryTabName('');
    setSelectedCategoryIconName(DEFAULT_TAB_ICON_NAME);
    onOpenChange(false);
  };

  // House style prefers if/else over a ternary, even inline in JSX
  // (docs/coding-standards.md §6).
  let submitLabel = 'Create Tab';
  if (isSaving) {
    submitLabel = 'Creating…';
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Tab</DialogTitle>
            <DialogDescription>Enter the name and choose an icon for your new tab.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="tab-name">Tab Name</Label>
              <Input
                id="tab-name"
                value={categoryTabName}
                onChange={(event) => setCategoryTabName(event.target.value)}
                placeholder="e.g., Books, Concerts, Recipes..."
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Choose an Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {TAB_ICONS.map(({ name: iconName, icon: IconComponent }) => {
                  const isSelectedIcon = selectedCategoryIconName === iconName;
                  let iconButtonStyle: React.CSSProperties = {};
                  let iconButtonBorderClass: string;
                  if (isSelectedIcon && currentTheme) {
                    iconButtonStyle = {
                      borderColor: currentTheme.accentColor,
                      backgroundColor: colorToRgba(currentTheme.accentColor, 0.1),
                    };
                    iconButtonBorderClass = '';
                  } else if (isSelectedIcon) {
                    iconButtonBorderClass = 'border-primary bg-primary/10';
                  } else {
                    iconButtonBorderClass = 'border-border';
                  }
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedCategoryIconName(iconName)}
                      className={`p-3 rounded-md border-2 transition-all hover:border-primary/50 ${iconButtonBorderClass}`}
                      style={iconButtonStyle}
                    >
                      <IconComponent className="h-5 w-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
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
              disabled={!categoryTabName.trim() || isSaving}
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
