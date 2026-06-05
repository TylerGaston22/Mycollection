/**
 * MobileListItem – Goodreads-style horizontal row for mobile.
 * Large poster thumbnail on the left, title / year / star rating on the right.
 */

import { useState } from 'react';
import { Item } from "../../types";
import { StarRating } from "../item/StarRating";
import { useItemActions } from "../../hooks/useItemActions";
import { sanitizeImageUrl } from "../../utils/sanitize";

const ERROR_IMG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface MobileListItemProps {
  item: Item;
  onUpdate: (id: string, updates: Partial<Item>) => void;
  onClick: (item: Item) => void;
}

export function MobileListItem({ item, onUpdate, onClick }: MobileListItemProps) {
  const [hasImageLoadError, setHasImageLoadError] = useState(false);
  const { setRating } = useItemActions(onUpdate);

  const safePosterUrl = sanitizeImageUrl(item.posterUrl);

  let thumbnail;
  if (safePosterUrl && !hasImageLoadError) {
    thumbnail = (
      <img
        src={safePosterUrl}
        alt={item.title}
        className="w-20 h-28 object-cover rounded shadow-sm"
        onError={() => setHasImageLoadError(true)}
      />
    );
  } else {
    thumbnail = (
      <div className="w-20 h-28 rounded bg-page-surface flex items-center justify-center shadow-sm">
        <img src={ERROR_IMG} alt="" className="w-8 h-8 opacity-40" />
      </div>
    );
  }

  return (
    <button
      onClick={() => onClick(item)}
      className="flex items-start gap-4 w-full text-left px-4 py-4"
    >
      <div className="flex-shrink-0">
        {thumbnail}
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <h3 className="text-page-fg font-semibold text-base leading-snug line-clamp-2">
          {item.title}
        </h3>
        {item.year && (
          <p className="text-page-fg-muted text-sm mt-0.5">{item.year}</p>
        )}

        {item.status === 'watched' && (
          <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-page-fg-muted text-xs">Rate this:</span>
            <StarRating item={item} onRate={setRating} />
          </div>
        )}

        {item.notes && (
          <p className="text-page-fg-faint text-xs mt-1.5 line-clamp-1">{item.notes}</p>
        )}
      </div>
    </button>
  );
}
