/**
 * useItemActions – shared item interaction handlers.
 * Provides toggleFavorite, toggleStatus, and setRating actions
 * used by both ItemCard (grid view) and ListView (table view).
 */

import { Item } from '../types';
import type { ItemStatus } from '../constants';

export function useItemActions(onUpdate: (id: string, updates: Partial<Item>) => void) {
  const toggleFavorite = (item: Item) => {
    onUpdate(item.id, { favorite: !item.favorite });
  };

  const toggleStatus = (item: Item) => {
    let newStatus: ItemStatus;
    if (item.status === 'watched') {
      newStatus = 'want-to-see';
    } else {
      newStatus = 'watched';
    }
    onUpdate(item.id, { status: newStatus });
  };

  // Clicking the current rating clears it (toggle behaviour)
  const setRating = (item: Item, starRatingNumber: number) => {
    let newRatingValue: number | undefined;
    if (item.rating === starRatingNumber) {
      newRatingValue = undefined;
    } else {
      newRatingValue = starRatingNumber;
    }
    onUpdate(item.id, { rating: newRatingValue });
  };

  return { toggleFavorite, toggleStatus, setRating };
}
