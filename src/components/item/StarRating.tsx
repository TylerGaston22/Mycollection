/**
 * StarRating – reusable 1-5 star rating display with click-to-set.
 * Clicking the current rating clears it. Used by both ItemCard and ListView.
 */

import { Star } from 'lucide-react';
import { Item } from "../../types";

interface StarRatingProps {
  item: Item;
  onRate: (item: Item, starRatingNumber: number) => void;
}

export function StarRating({ item, onRate }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((starRatingNumber) => {
        let starIconColorClass = 'text-muted-foreground/40';
        if (item.rating && starRatingNumber <= item.rating) {
          starIconColorClass = 'fill-yellow-500 text-yellow-500';
        }
        return (
          <button
            key={starRatingNumber}
            onClick={() => onRate(item, starRatingNumber)}
            className="hover:scale-110 transition-transform"
          >
            <Star className={`h-4 w-4 ${starIconColorClass}`} />
          </button>
        );
      })}
    </div>
  );
}
