/**
 * useCollectionStats – derives per-content-type counts from the items list.
 * Memoised so consumers don't re-filter the array on every render.
 */

import { useMemo } from 'react';
import { Item } from '../types';

export function useCollectionStats(items: Item[]) {
  return useMemo(() => {
    const byType: Record<string, number> = {};
    for (const item of items) {
      byType[item.type] = (byType[item.type] || 0) + 1;
    }
    return {
      movieCount: byType.item || 0,
      tvShowCount: byType['tv-show'] || 0,
      restaurantCount: byType.restaurant || 0,
      placeCount: byType.place || 0,
    };
  }, [items]);
}
