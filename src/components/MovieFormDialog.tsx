/**
 * MovieFormDialog – add/edit dialog for collection items.
 * Serves double duty: when `movie` is provided it operates in edit mode,
 * otherwise it creates a new item. Field labels and placeholders adapt
 * automatically to the content type via getContentTypeFieldConfig().
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Movie, CustomSection } from "../types";
import { ThemeConfig } from "../utils/themeConfig";
import { getContentTypeFieldConfig, getWatchedLabel, getWantToSeeLabel, isMediaContentType } from "../utils/contentHelpers";

interface MovieFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customSections?: CustomSection[];
  contentType?: string;
  activeSection?: string;
  currentTheme?: ThemeConfig;
  onAdd?: (movie: Omit<Movie, 'id'>) => void;
  movie?: Movie | null;
  onUpdate?: (id: string, updates: Partial<Movie>) => void;
}

export function MovieFormDialog({
  open,
  onOpenChange,
  customSections = [],
  contentType,
  activeSection,
  currentTheme,
  onAdd,
  movie,
  onUpdate,
}: MovieFormDialogProps) {
  // Determine content type: from the item being edited, the active tab, or default to 'movie'
  const itemContentType = movie?.type ?? contentType ?? 'movie';
  const isEditingExistingItem = !!movie;
  const fieldConfig = getContentTypeFieldConfig(itemContentType);
  const isMovieOrTvShow = isMediaContentType(itemContentType);

  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [status, setStatus] = useState<'watched' | 'want-to-see'>('watched');
  const [notes, setNotes] = useState('');
  const [platform, setPlatform] = useState('');
  const [studio, setStudio] = useState('');
  const [genre, setGenre] = useState('');
  const [seasons, setSeasons] = useState('');
  const [episodes, setEpisodes] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const sectionsForCurrentContentType = customSections.filter((section) => section.contentType === itemContentType);

  // Populate form fields when the dialog opens (edit mode copies from movie, add mode resets)
  useEffect(() => {
    if (!open) return;
    if (movie) {
      setTitle(movie.title);
      setYear(movie.year || '');
      setPosterUrl(movie.posterUrl || '');
      setStatus(movie.status);
      setNotes(movie.notes || '');
      setPlatform(movie.platform || '');
      setStudio(movie.studio || '');
      setGenre(movie.genre || '');
      setSeasons(movie.seasons?.toString() || '');
      setEpisodes(movie.episodes?.toString() || '');
      setSelectedSections(movie.sections || []);
    } else {
      setTitle(''); setYear(''); setPosterUrl(''); setStatus('watched');
      setNotes(''); setPlatform(''); setStudio(''); setGenre('');
      setSeasons(''); setEpisodes('');

      // Pre-select the currently active section if it belongs to this content type
      let preSelectedSectionIds: string[] = [];
      if (activeSection) {
        const activeSectionBelongsToCurrentContentType = customSections.some(
          (section) => section.id === activeSection && section.contentType === contentType
        );
        if (activeSectionBelongsToCurrentContentType) {
          preSelectedSectionIds = [activeSection];
        }
      }
      setSelectedSections(preSelectedSectionIds);
    }
  }, [open, movie, activeSection, customSections, contentType]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    let parsedSeasonsValue: number | undefined = undefined;
    if (seasons) {
      parsedSeasonsValue = parseInt(seasons);
    }

    let parsedEpisodesValue: number | undefined = undefined;
    if (episodes) {
      parsedEpisodesValue = parseInt(episodes);
    }

    let sectionsToSave: string[] | undefined = undefined;
    if (selectedSections.length > 0) {
      sectionsToSave = selectedSections;
    }

    const formDataToSave = {
      title: title.trim(),
      year: year.trim() || undefined,
      posterUrl: posterUrl.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
      platform: platform.trim() || undefined,
      studio: studio.trim() || undefined,
      genre: genre.trim() || undefined,
      seasons: parsedSeasonsValue,
      episodes: parsedEpisodesValue,
      sections: sectionsToSave,
    };

    if (isEditingExistingItem && movie) {
      onUpdate?.(movie.id, formDataToSave);
    } else {
      onAdd?.({ ...formDataToSave, type: itemContentType, favorite: false });
    }
    onOpenChange(false);
  };

  let dialogActionWord: string;
  if (isEditingExistingItem) {
    dialogActionWord = 'Edit';
  } else {
    dialogActionWord = 'Add';
  }

  let dialogDescriptionText: string;
  if (isEditingExistingItem) {
    dialogDescriptionText = 'Update the details of this item';
  } else {
    dialogDescriptionText = `Add a new ${fieldConfig.displayLabel.toLowerCase()} to your collection`;
  }

  let submitButtonLabel: string;
  if (isEditingExistingItem) {
    submitButtonLabel = 'Save Changes';
  } else {
    submitButtonLabel = `Add ${fieldConfig.displayLabel}`;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dialogActionWord} {fieldConfig.displayLabel}</DialogTitle>
            <DialogDescription>{dialogDescriptionText}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mf-title">{fieldConfig.titleFieldLabel} *</Label>
              <Input
                id="mf-title"
                placeholder={`Enter ${fieldConfig.displayLabel.toLowerCase()} ${fieldConfig.titleFieldWord}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-year">{fieldConfig.yearFieldLabel}</Label>
              <Input
                id="mf-year"
                placeholder={fieldConfig.yearFieldPlaceholder}
                value={year}
                onChange={(event) => setYear(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-poster">{fieldConfig.imageUrlLabel}</Label>
              <Input
                id="mf-poster"
                placeholder="https://..."
                value={posterUrl}
                onChange={(event) => setPosterUrl(event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <RadioGroup value={status} onValueChange={(newValue: string) => setStatus(newValue as 'watched' | 'want-to-see')}>
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
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              />
            </div>

            {isMovieOrTvShow && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="mf-studio">Studio</Label>
                  <Input
                    id="mf-studio"
                    placeholder="Studio Ghibli, Pixar, etc."
                    value={studio}
                    onChange={(event) => setStudio(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mf-genre">Genre/Type</Label>
                  <Input
                    id="mf-genre"
                    placeholder="Animated, Korean Drama, Action, etc."
                    value={genre}
                    onChange={(event) => setGenre(event.target.value)}
                  />
                </div>
              </>
            )}

            {itemContentType === 'tv-show' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mf-seasons">Seasons</Label>
                  <Input id="mf-seasons" type="number" min="1" placeholder="1" value={seasons} onChange={(event) => setSeasons(event.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mf-episodes">Episodes</Label>
                  <Input id="mf-episodes" type="number" min="1" placeholder="10" value={episodes} onChange={(event) => setEpisodes(event.target.value)} />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="mf-notes">Notes</Label>
              <Textarea
                id="mf-notes"
                placeholder="Add your thoughts..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
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
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={(isNowChecked: boolean | 'indeterminate') => {
                          if (isNowChecked) {
                            setSelectedSections([...selectedSections, section.id]);
                          } else {
                            setSelectedSections(selectedSections.filter((sectionId) => sectionId !== section.id));
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              type="submit"
              disabled={!title.trim()}
              style={currentTheme ? { backgroundColor: currentTheme.accentColor } : undefined}
              className={currentTheme ? "text-white hover:opacity-90" : ""}
            >
              {submitButtonLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
