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
import { Movie } from "../types/movie";
import { CustomSection } from "../types/customSection";

interface MovieFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customSections?: CustomSection[];
  // Add mode
  contentType?: string;
  activeSection?: string;
  onAdd?: (movie: Omit<Movie, 'id'>) => void;
  // Edit mode
  movie?: Movie | null;
  onUpdate?: (id: string, updates: Partial<Movie>) => void;
}

export function MovieFormDialog({
  open,
  onOpenChange,
  customSections = [],
  contentType,
  activeSection,
  onAdd,
  movie,
  onUpdate,
}: MovieFormDialogProps) {
  const type = movie?.type ?? contentType ?? 'movie';
  const isEdit = !!movie;

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

  const relevantSections = customSections.filter(s => s.contentType === type);

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
      const autoSection = activeSection && customSections.some(s => s.id === activeSection && s.contentType === contentType)
        ? [activeSection] : [];
      setSelectedSections(autoSection);
    }
  }, [open, movie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const fields = {
      title: title.trim(),
      year: year.trim() || undefined,
      posterUrl: posterUrl.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
      platform: platform.trim() || undefined,
      studio: studio.trim() || undefined,
      genre: genre.trim() || undefined,
      seasons: seasons ? parseInt(seasons) : undefined,
      episodes: episodes ? parseInt(episodes) : undefined,
      sections: selectedSections.length > 0 ? selectedSections : undefined,
    };

    if (isEdit && movie) {
      onUpdate?.(movie.id, fields);
    } else {
      onAdd?.({ ...fields, type, favorite: false });
    }
    onOpenChange(false);
  };

  const typeLabel = type === 'movie' ? 'Movie'
    : type === 'tv-show' ? 'TV Show'
    : type === 'restaurant' ? 'Restaurant'
    : 'Place';

  const isMediaType = type === 'movie' || type === 'tv-show';
  const locationLabel = type === 'restaurant' || type === 'place' ? 'Location' : 'Year';
  const locationPlaceholder = type === 'restaurant' || type === 'place' ? 'City, Country' : '2024';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit' : 'Add'} {typeLabel}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update the details of this item' : `Add a new ${typeLabel.toLowerCase()} to your collection`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mf-title">
                {type === 'restaurant' ? 'Name' : type === 'place' ? 'Place Name' : 'Title'} *
              </Label>
              <Input
                id="mf-title"
                placeholder={`Enter ${typeLabel.toLowerCase()} ${type === 'restaurant' || type === 'place' ? 'name' : 'title'}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-year">{locationLabel}</Label>
              <Input
                id="mf-year"
                placeholder={locationPlaceholder}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-poster">{isMediaType ? 'Poster URL' : 'Photo URL'}</Label>
              <Input
                id="mf-poster"
                placeholder="https://..."
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <RadioGroup value={status} onValueChange={(v) => setStatus(v as 'watched' | 'want-to-see')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="watched" id="mf-watched" />
                  <Label htmlFor="mf-watched" className="cursor-pointer">
                    {isMediaType ? 'Watched' : 'Visited'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="want-to-see" id="mf-want-to-see" />
                  <Label htmlFor="mf-want-to-see" className="cursor-pointer">
                    {isMediaType ? 'Want to See' : 'Want to Visit'}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mf-platform">
                {isMediaType ? 'Where to Watch' : 'Additional Info'}
              </Label>
              <Input
                id="mf-platform"
                placeholder={isMediaType ? 'Netflix, Disney+, Hulu, etc.' : 'Additional details...'}
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
            </div>

            {isMediaType && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="mf-studio">Studio</Label>
                  <Input
                    id="mf-studio"
                    placeholder="Studio Ghibli, Pixar, etc."
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mf-genre">Genre/Type</Label>
                  <Input
                    id="mf-genre"
                    placeholder="Animated, Korean Drama, Action, etc."
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  />
                </div>
              </>
            )}

            {type === 'tv-show' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mf-seasons">Seasons</Label>
                  <Input id="mf-seasons" type="number" min="1" placeholder="1" value={seasons} onChange={(e) => setSeasons(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mf-episodes">Episodes</Label>
                  <Input id="mf-episodes" type="number" min="1" placeholder="10" value={episodes} onChange={(e) => setEpisodes(e.target.value)} />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="mf-notes">Notes</Label>
              <Textarea
                id="mf-notes"
                placeholder="Add your thoughts..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {relevantSections.length > 0 && (
              <div className="grid gap-2">
                <Label>Add to Sections</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {relevantSections.map(section => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mf-section-${section.id}`}
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={(checked) =>
                          setSelectedSections(checked
                            ? [...selectedSections, section.id]
                            : selectedSections.filter(id => id !== section.id)
                          )
                        }
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
            <Button type="submit" disabled={!title.trim()}>
              {isEdit ? 'Save Changes' : `Add ${typeLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
