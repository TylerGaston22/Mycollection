/**
 * useItemActions – shared item interaction handlers.
 * Provides toggleFavorite, toggleStatus, and setRating actions
 * used by both MovieCard (grid view) and ListView (table view).
 */

import { Movie } from '../types';
import type { ItemStatus } from '../constants';

export function useItemActions(onUpdate: (id: string, updates: Partial<Movie>) => void) {
  const toggleFavorite = (movie: Movie) => {
    onUpdate(movie.id, { favorite: !movie.favorite });
  };

  const toggleStatus = (movie: Movie) => {
    let newStatus: ItemStatus;
    if (movie.status === 'watched') {
      newStatus = 'want-to-see';
    } else {
      newStatus = 'watched';
    }
    onUpdate(movie.id, { status: newStatus });
  };

  // Clicking the current rating clears it (toggle behaviour)
  const setRating = (movie: Movie, starRatingNumber: number) => {
    let newRatingValue: number | undefined;
    if (movie.rating === starRatingNumber) {
      newRatingValue = undefined;
    } else {
      newRatingValue = starRatingNumber;
    }
    onUpdate(movie.id, { rating: newRatingValue });
  };

  return { toggleFavorite, toggleStatus, setRating };
}
