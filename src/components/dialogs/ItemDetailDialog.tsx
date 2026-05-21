/**
 * ItemDetailDialog – read-only detail view for a collection item.
 * Displays platform, studio, genre, season/episode counts, and notes.
 * Field labels adapt to the content type (item, TV show, restaurant,
 * or place). An inline "Edit" button opens the ItemFormDialog.
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ThemePrimaryButton } from "../ui/ThemePrimaryButton";
import { Tv, Film, ExternalLink, Edit } from 'lucide-react';
import { Item, CustomSection } from "../../types";
import { ThemeConfig } from "../../utils/themeConfig";
import { pluralize } from "../../utils/pluralize";
import { Separator } from "../ui/separator";
import { ItemFormDialog } from "./ItemFormDialog";

interface MovieDetailDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  customSections?: CustomSection[];
  currentTheme?: ThemeConfig;
}

export function ItemDetailDialog({
  item,
  open,
  onOpenChange,
  onUpdate,
  customSections = [],
  currentTheme
}: MovieDetailDialogProps) {
  const [isMovieEditDialogOpen, setIsMovieEditDialogOpen] = useState(false);

  if (!item) return null;

  const movieHasAdditionalDetails = item.platform || item.studio || item.genre || (item.type === 'tv-show' && (item.seasons || item.episodes)) || item.notes;

  let contentTypeHeaderIcon = null;
  if (item.type === 'tv-show') {
    contentTypeHeaderIcon = <Tv className="h-5 w-5" />;
  } else if (item.type === 'item') {
    contentTypeHeaderIcon = <Film className="h-5 w-5" />;
  }

  let platformFieldHeadingText;
  if (item.type === 'restaurant') {
    platformFieldHeadingText = 'Cuisine Type';
  } else if (item.type === 'place') {
    platformFieldHeadingText = 'Location';
  } else {
    platformFieldHeadingText = 'Where to Watch';
  }

  const seasonsPluralLabel = pluralize(item.seasons ?? 0, 'season');
  const episodesPluralLabel = pluralize(item.episodes ?? 0, 'episode');

  let movieDetailsContent;
  if (movieHasAdditionalDetails) {
    movieDetailsContent = (
      <div className="space-y-4">
        {/* Streaming Platform */}
        {item.platform && (
          <div className="space-y-3">
            <div>
              <h4 className="mb-2">{platformFieldHeadingText}</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-2 px-3 py-1">
                  <ExternalLink className="h-4 w-4" />
                  {item.platform}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Studio */}
        {item.studio && (
          <div className="space-y-2">
            <div className="text-muted-foreground">Studio</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2 px-3 py-1">
                {item.studio}
              </Badge>
            </div>
          </div>
        )}

        {/* Genre/Type */}
        {item.genre && (
          <div className="space-y-2">
            <div className="text-muted-foreground">Genre/Type</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2 px-3 py-1">
                {item.genre}
              </Badge>
            </div>
          </div>
        )}

        {/* Seasons/Episodes for TV Shows */}
        {item.type === 'tv-show' && (item.seasons || item.episodes) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {item.seasons && (
                <div className="space-y-2">
                  <div className="text-muted-foreground">Seasons</div>
                  <p>{item.seasons} {seasonsPluralLabel}</p>
                </div>
              )}
              {item.episodes && (
                <div className="space-y-2">
                  <div className="text-muted-foreground">Episodes</div>
                  <p>{item.episodes} {episodesPluralLabel}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Notes */}
        {item.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-muted-foreground">Notes</div>
              <p className="bg-muted p-3 rounded-lg">
                {item.notes}
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
                {item.title}
              </div>
              <ThemePrimaryButton
                variant="outline"
                size="sm"
                onClick={() => setIsMovieEditDialogOpen(true)}
                currentTheme={currentTheme}
                style={currentTheme ? { borderColor: currentTheme.accentColor } : undefined}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </ThemePrimaryButton>
            </DialogTitle>
            <DialogDescription>
              View and manage details for this item.
            </DialogDescription>
          </DialogHeader>

          {movieDetailsContent}
        </DialogContent>
      </Dialog>

      <ItemFormDialog
        item={item}
        open={isMovieEditDialogOpen}
        onOpenChange={setIsMovieEditDialogOpen}
        onUpdate={onUpdate}
        customSections={customSections}
      />
    </>
  );
}
