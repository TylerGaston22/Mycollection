/**
 * StarRating – reusable 1-5 star rating display with click-to-set.
 * Clicking the current rating clears it. Used by both MovieCard and ListView.
 */

import { Star } from 'lucide-react';
import { Movie } from "../types";

interface StarRatingProps {
  movie: Movie;
  onRate: (movie: Movie, star: number) => void;
}

export function StarRating({ movie, onRate }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        let starClass = 'text-muted-foreground/40';
        if (movie.rating && star <= movie.rating) {
          starClass = 'fill-yellow-500 text-yellow-500';
        }
        return (
          <button
            key={star}
            onClick={() => onRate(movie, star)}
            className="hover:scale-110 transition-transform"
          >
            <Star className={`h-4 w-4 ${starClass}`} />
          </button>
        );
      })}
    </div>
  );
}
