/**
 * ItemFormDialog – add/edit dialog for collection items.
 * Serves double duty: when `item` is provided it operates in edit mode,
 * otherwise it creates a new item. Field labels and placeholders adapt
 * automatically to the content type via getContentTypeFieldConfig().
 *
 * All form state + populate-on-open + submit logic lives in
 * ./itemForm/useItemForm.ts; this component is the dialog shell + the
 * field JSX bound to that hook.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ThemePrimaryButton } from "../ui/ThemePrimaryButton";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { Item, CustomSection } from "../../types";
import { ThemeConfig } from "../../utils/themeConfig";
import {
  getContentTypeFieldConfig,
  getWatchedLabel,
  getWantToSeeLabel,
  isMediaContentType,
} from "../../utils/contentHelpers";
import { TmdbSearchableInput } from "../../tmdb";
import { DEFAULT_CONTENT_TYPE, type ItemStatus } from "../../constants";
import { useItemForm } from "./itemForm/useItemForm";

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customSections?: CustomSection[];
  contentType?: string;
  activeSection?: string;
  currentTheme?: ThemeConfig;
  onAdd?: (item: Omit<Item, "id">) => void;
  item?: Item | null;
  onUpdate?: (id: string, updates: Partial<Item>) => void;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  customSections = [],
  contentType,
  activeSection,
  currentTheme,
  onAdd,
  item,
  onUpdate,
}: ItemFormDialogProps) {
  // Determine content type: from the item being edited, the active tab,
  // or the default. Drives field labels + which optional fields show.
  const itemContentType = item?.type ?? contentType ?? DEFAULT_CONTENT_TYPE;
  const isEditingExistingItem = !!item;
  const fieldConfig = getContentTypeFieldConfig(itemContentType);
  const isMovieOrTvShow = isMediaContentType(itemContentType);
  const sectionsForCurrentContentType = customSections.filter(
    (section) => section.contentType === itemContentType,
  );

  const form = useItemForm({
    open,
    item,
    contentType: itemContentType,
    activeSection,
    customSections,
    onAdd,
    onUpdate,
    onSubmitted: () => onOpenChange(false),
  });

  const dialogActionWord = isEditingExistingItem ? "Edit" : "Add";
  const submitButtonLabel = isEditingExistingItem
    ? "Save Changes"
    : `Add ${fieldConfig.displayLabel}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {dialogActionWord} {fieldConfig.displayLabel}
            </DialogTitle>
            <DialogDescription>
              {buildDialogDescription({
                isEditingExistingItem,
                itemContentType,
                activeSection,
                customSections,
                fieldConfig,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mf-title">{fieldConfig.titleFieldLabel} *</Label>
              <TmdbSearchableInput
                id="mf-title"
                contentType={itemContentType}
                value={form.title}
                onChange={form.setTitle}
                onPick={(result) => {
                  form.setTitle(result.title);
                  if (result.year) form.setYear(result.year);
                  if (result.posterUrl) form.setPosterUrl(result.posterUrl);
                }}
                resetSignal={form.tmdbResetCount}
                placeholder={`Enter ${fieldConfig.displayLabel.toLowerCase()} ${fieldConfig.titleFieldWord}`}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-year">{fieldConfig.yearFieldLabel}</Label>
              <Input
                id="mf-year"
                placeholder={fieldConfig.yearFieldPlaceholder}
                value={form.year}
                onChange={(event) => form.setYear(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-poster">{fieldConfig.imageUrlLabel}</Label>
              <Input
                id="mf-poster"
                placeholder="https://..."
                value={form.posterUrl}
                onChange={(event) => form.setPosterUrl(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <RadioGroup
                value={form.status}
                onValueChange={(newValue: string) => form.setStatus(newValue as ItemStatus)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="watched" id="mf-watched" />
                  <Label htmlFor="mf-watched" className="cursor-pointer">
                    {getWatchedLabel(itemContentType)}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="want-to-see" id="mf-want-to-see" />
                  <Label htmlFor="mf-want-to-see" className="cursor-pointer">
                    {getWantToSeeLabel(itemContentType)}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-platform">{fieldConfig.platformFieldLabel}</Label>
              <Input
                id="mf-platform"
                placeholder={fieldConfig.platformFieldPlaceholder}
                value={form.platform}
                onChange={(event) => form.setPlatform(event.target.value)}
              />
            </div>

            {isMovieOrTvShow && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="mf-studio">Studio</Label>
                  <Input
                    id="mf-studio"
                    placeholder="Studio Ghibli, Pixar, etc."
                    value={form.studio}
                    onChange={(event) => form.setStudio(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mf-genre">Genre/Type</Label>
                  <Input
                    id="mf-genre"
                    placeholder="Animated, Korean Drama, Action, etc."
                    value={form.genre}
                    onChange={(event) => form.setGenre(event.target.value)}
                  />
                </div>
              </>
            )}

            {itemContentType === "tv-show" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mf-seasons">Seasons</Label>
                  <Input
                    id="mf-seasons"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.seasons}
                    onChange={(event) => form.setSeasons(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mf-episodes">Episodes</Label>
                  <Input
                    id="mf-episodes"
                    type="number"
                    min="1"
                    placeholder="10"
                    value={form.episodes}
                    onChange={(event) => form.setEpisodes(event.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="mf-notes">Notes</Label>
              <Textarea
                id="mf-notes"
                placeholder="Add your thoughts..."
                value={form.notes}
                onChange={(event) => form.setNotes(event.target.value)}
                rows={3}
              />
            </div>

            {sectionsForCurrentContentType.length > 0 && (
              <div className="grid gap-2">
                <Label>Add to Sections</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {sectionsForCurrentContentType.map((section) => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mf-section-${section.id}`}
                        checked={form.selectedSections.includes(section.id)}
                        onCheckedChange={(isNowChecked: boolean | "indeterminate") => {
                          if (isNowChecked) {
                            form.setSelectedSections([...form.selectedSections, section.id]);
                          } else {
                            form.setSelectedSections(
                              form.selectedSections.filter((sectionId) => sectionId !== section.id),
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`mf-section-${section.id}`} className="cursor-pointer">
                        {section.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer so the Cancel / Add buttons stay visible without
              scrolling past every optional field. The bg-background match
              keeps the form fields above from showing through. */}
          <DialogFooter className="sticky bottom-0 -mx-6 px-6 py-4 bg-background border-t z-10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <ThemePrimaryButton type="submit" disabled={!form.isValid} currentTheme={currentTheme}>
              {submitButtonLabel}
            </ThemePrimaryButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Builds the "Adding to: <Category> › <Section>" hint that appears under
 * the dialog title in add mode. Edit mode shows a fixed string instead.
 * Plain helper (not a component) since it's just string assembly.
 */
function buildDialogDescription({
  isEditingExistingItem,
  itemContentType,
  activeSection,
  customSections,
  fieldConfig,
}: {
  isEditingExistingItem: boolean;
  itemContentType: string;
  activeSection: string | undefined;
  customSections: CustomSection[];
  fieldConfig: ReturnType<typeof getContentTypeFieldConfig>;
}): string {
  if (isEditingExistingItem) {
    return "Update the details of this item";
  }

  const customSectionName = customSections.find(
    (s) => s.id === activeSection && s.contentType === itemContentType,
  )?.name;

  let sectionLabel: string | null = null;
  if (customSectionName) sectionLabel = customSectionName;
  else if (activeSection === "watched") sectionLabel = getWatchedLabel(itemContentType);
  else if (activeSection === "want-to-see") sectionLabel = getWantToSeeLabel(itemContentType);
  else if (activeSection === "favorites") sectionLabel = "Favorites";
  else if (activeSection === "all") sectionLabel = "All";

  return sectionLabel
    ? `Adding to: ${fieldConfig.displayLabel} › ${sectionLabel}`
    : `Add a new ${fieldConfig.displayLabel.toLowerCase()} to your collection`;
}
