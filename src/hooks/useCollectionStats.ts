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
    // TEMP DEBUG — remove once Games count bug is resolved.
    // eslint-disable-next-line no-console
    console.log('[useCollectionStats]', {
      totalItems: items.length,
      byType,
      sampleGameTypes: items.filter((i) => i.type === 'game').slice(0, 3).map((i) => ({ id: i.id, type: i.type, title: i.title })),
    });
    return {
      movieCount: byType.item || 0,
      tvShowCount: byType['tv-show'] || 0,
      restaurantCount: byType.restaurant || 0,
      placeCount: byType.place || 0,
      gameCount: byType.game || 0,
    };
  }, [items]);
}
