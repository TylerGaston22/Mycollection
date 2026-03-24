/**
 * useItemActions – shared item interaction handlers.
 * Provides toggleFavorite, toggleStatus, and setRating actions
 * used by both MovieCard (grid view) and ListView (table view).
 */

import { Movie } from '../types';

export function useItemActions(onUpdate: (id: string, updates: Partial<Movie>) => void) {
  const toggleFavorite = (movie: Movie) => {
    onUpdate(movie.id, { favorite: !movie.favorite });
  };

  const toggleStatus = (movie: Movie) => {
    let newStatus: 'watched' | 'want-to-see';
    if (movie.status === 'watched') {
      newStatus = 'want-to-see';
    } else {
      newStatus = 'watched';
    }
    onUpdate(movie.id, { status: newStatus });
  };

  const setRating = (movie: Movie, star: number) => {
    let newRating: number | undefined;
    if (movie.rating === star) {
      newRating = undefined;
    } else {
      newRating = star;
    }
    onUpdate(movie.id, { rating: newRating });
  };

  return { toggleFavorite, toggleStatus, setRating };
}
