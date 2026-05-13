/**
 * ItemCard – grid-view card for a single collection item.
 * Shows a poster image (with error fallback), favourite toggle, status
 * badge, star rating (for watched items), notes preview, and a
 * dropdown actions menu.
 */

import { useState } from 'react';
import { Item } from "../../types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Heart, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useItemActions } from "../../hooks/useItemActions";
import { sanitizeImageUrl } from "../../utils/sanitize";
import { StarRating } from "./StarRating";
import { StatusBadge } from "./StatusBadge";
import { StatusToggleMenuContent } from "./StatusToggleMenuContent";

// Base64-encoded SVG placeholder shown when a poster image fails to load
const ERROR_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

function PosterImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [hasImageLoadError, setHasImageLoadError] = useState(false);
  if (hasImageLoadError) {
    return (
      <div className={`inline-block bg-muted flex items-center justify-center w-full h-full ${className ?? ''}`}>
        <img src={ERROR_IMG} alt="Error loading image" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setHasImageLoadError(true)} />;
}

interface MovieCardProps {
  item: Item;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onDelete: (id: string) => void;
}

export function ItemCard({ item, onUpdate, onDelete }: MovieCardProps) {
  const { toggleFavorite, toggleStatus, setRating } = useItemActions(onUpdate);

  let heartIconColorClass: string;
  if (item.favorite) {
    heartIconColorClass = 'fill-red-500 text-red-500';
  } else {
    heartIconColorClass = 'text-white stroke-white stroke-2';
  }

  let favoriteMenuItemText: string;
  if (item.favorite) {
    favoriteMenuItemText = 'Remove from Favorites';
  } else {
    favoriteMenuItemText = 'Add to Favorites';
  }

  const safePosterUrl = sanitizeImageUrl(item.posterUrl);

  let posterDisplayContent;
  if (safePosterUrl) {
    posterDisplayContent = (
      <PosterImage
        src={safePosterUrl}
        alt={item.title}
        className="w-full h-full object-cover"
      />
    );
  } else {
    posterDisplayContent = (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/20">
        <span className="text-muted-foreground text-center px-4">
          {item.title}
        </span>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-muted overflow-hidden">
        {posterDisplayContent}

        {/* Favorite button */}
        <button
          onClick={() => toggleFavorite(item)}
          className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <Heart className={`h-5 w-5 ${heartIconColorClass}`} />
        </button>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={item.status} contentType={item.type} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="truncate">{item.title}</h3>
            {item.year && (
              <p className="text-muted-foreground">{item.year}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toggleStatus(item)}>
                <StatusToggleMenuContent currentStatus={item.status} contentType={item.type} />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFavorite(item)}>
                <Heart className="h-4 w-4 mr-2" />
                {favoriteMenuItemText}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Rating */}
        {item.status === 'watched' && (
          <div className="mb-2">
            <StarRating item={item} onRate={setRating} />
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <p className="text-muted-foreground line-clamp-2">
            {item.notes}
          </p>
        )}
      </div>
    </Card>
  );
}
