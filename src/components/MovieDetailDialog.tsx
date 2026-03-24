/**
 * MovieDetailDialog – read-only detail view for a collection item.
 * Displays platform, studio, genre, season/episode counts, and notes.
 * Field labels adapt to the content type (movie, TV show, restaurant,
 * or place). An inline "Edit" button opens the MovieFormDialog.
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tv, Film, ExternalLink, Edit } from 'lucide-react';
import { Movie, CustomSection } from "../types";
import { ThemeConfig } from "../utils/themeConfig";
import { Separator } from "./ui/separator";
import { MovieFormDialog } from "./MovieFormDialog";

interface MovieDetailDialogProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Movie>) => void;
  customSections?: CustomSection[];
  currentTheme?: ThemeConfig;
}

export function MovieDetailDialog({
  movie,
  open,
  onOpenChange,
  onUpdate,
  customSections = [],
  currentTheme
}: MovieDetailDialogProps) {
  const [isMovieEditDialogOpen, setIsMovieEditDialogOpen] = useState(false);

  if (!movie) return null;

  const movieHasAdditionalDetails = movie.platform || movie.studio || movie.genre || (movie.type === 'tv-show' && (movie.seasons || movie.episodes)) || movie.notes;

  let contentTypeHeaderIcon = null;
  if (movie.type === 'tv-show') {
    contentTypeHeaderIcon = <Tv className="h-5 w-5" />;
  } else if (movie.type === 'movie') {
    contentTypeHeaderIcon = <Film className="h-5 w-5" />;
  }

  let platformFieldHeadingText;
  if (movie.type === 'restaurant') {
    platformFieldHeadingText = 'Cuisine Type';
  } else if (movie.type === 'place') {
    platformFieldHeadingText = 'Location';
  } else {
    platformFieldHeadingText = 'Where to Watch';
  }

  let seasonsPluralLabel;
  if (movie.seasons === 1) {
    seasonsPluralLabel = 'season';
  } else {
    seasonsPluralLabel = 'seasons';
  }

  let episodesPluralLabel;
  if (movie.episodes === 1) {
    episodesPluralLabel = 'episode';
  } else {
    episodesPluralLabel = 'episodes';
  }

  let movieDetailsContent;
  if (movieHasAdditionalDetails) {
    movieDetailsContent = (
      <div className="space-y-4">
        {/* Streaming Platform */}
        {movie.platform && (
          <div className="space-y-3">
            <div>
              <h4 className="mb-2">{platformFieldHeadingText}</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-2 px-3 py-1">
                  <ExternalLink className="h-4 w-4" />
                  {movie.platform}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Studio */}
        {movie.studio && (
          <div className="space-y-2">
            <div className="text-muted-foreground">Studio</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2 px-3 py-1">
                {movie.studio}
              </Badge>
            </div>
          </div>
        )}

        {/* Genre/Type */}
        {movie.genre && (
          <div className="space-y-2">
            <div className="text-muted-foreground">Genre/Type</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2 px-3 py-1">
                {movie.genre}
              </Badge>
            </div>
          </div>
        )}

        {/* Seasons/Episodes for TV Shows */}
        {movie.type === 'tv-show' && (movie.seasons || movie.episodes) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {movie.seasons && (
                <div className="space-y-2">
                  <div className="text-muted-foreground">Seasons</div>
                  <p>{movie.seasons} {seasonsPluralLabel}</p>
                </div>
              )}
              {movie.episodes && (
                <div className="space-y-2">
                  <div className="text-muted-foreground">Episodes</div>
                  <p>{movie.episodes} {episodesPluralLabel}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notes */}
        {movie.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-muted-foreground">Notes</div>
              <p className="bg-muted p-3 rounded-lg">
                {movie.notes}
              </p>
            </div>
          </>
        )}
      </div>
    );
  } else {
    movieDetailsContent = (
      <div className="text-center py-8 text-muted-foreground">
        No additional details available. Use the menu to edit and add more information.
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {contentTypeHeaderIcon}
                {movie.title}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMovieEditDialogOpen(true)}
                style={currentTheme ? {
                  backgroundColor: currentTheme.accentColor,
                  borderColor: currentTheme.accentColor,
                } : undefined}
                className={currentTheme ? "text-white hover:opacity-90" : ""}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTitle>
            <DialogDescription>
              View and manage details for this item.
            </DialogDescription>
          </DialogHeader>

          {movieDetailsContent}
        </DialogContent>
      </Dialog>

      <MovieFormDialog
        movie={movie}
        open={isMovieEditDialogOpen}
        onOpenChange={setIsMovieEditDialogOpen}
        onUpdate={onUpdate}
        customSections={customSections}
      />
    </>
  );
}
