/**
 * AddTabDialog – modal form for creating a custom sidebar tab.
 * Lets the user pick a name and an icon from a curated set of
 * Lucide icons, then delegates the new tab back via onAdd.
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
import { CustomTab } from "../types";
import {
  BookOpen,
  Coffee,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Lightbulb,
  Music,
  Palette,
  Plane,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';

const availableIcons = [
  { name: 'BookOpen', icon: BookOpen, label: 'Book' },
  { name: 'Coffee', icon: Coffee, label: 'Coffee' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { name: 'Gamepad2', icon: Gamepad2, label: 'Games' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Education' },
  { name: 'Heart', icon: Heart, label: 'Heart' },
  { name: 'Home', icon: Home, label: 'Home' },
  { name: 'Lightbulb', icon: Lightbulb, label: 'Ideas' },
  { name: 'Music', icon: Music, label: 'Music' },
  { name: 'Palette', icon: Palette, label: 'Art' },
  { name: 'Plane', icon: Plane, label: 'Travel' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles' },
  { name: 'Star', icon: Star, label: 'Star' },
  { name: 'Trophy', icon: Trophy, label: 'Trophy' },
  { name: 'Zap', icon: Zap, label: 'Zap' },
];

interface AddTabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (tab: Omit<CustomTab, 'id'>) => void;
}

export function AddTabDialog({ open, onOpenChange, onAdd }: AddTabDialogProps) {
  const [categoryTabName, setCategoryTabName] = useState('');
  const [selectedCategoryIconName, setSelectedCategoryIconName] = useState('Star');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryTabName.trim()) return;

    onAdd({
      name: categoryTabName.trim(),
      icon: selectedCategoryIconName,
    });

    // Reset form
    setCategoryTabName('');
    setSelectedCategoryIconName('Star');
    onOpenChange(false);
  };

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
                {availableIcons.map(({ name: iconName, icon: IconComponent }) => {
                  let iconButtonBorderClass;
                  if (selectedCategoryIconName === iconName) {
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
            <Button type="submit" disabled={!categoryTabName.trim()}>
              Create Tab
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
