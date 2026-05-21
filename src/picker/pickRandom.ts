/**
 * Pure random-pick helper for the dice picker.
 * Kept separate from the UI so it's trivial to test.
 */

import { Item } from "../types";

/**
 * Pick a random item from `items`. If `excludeId` is provided, the item
 * with that id is removed from the pool first so a re-roll actually
 * changes the selection.
 *
 * Returns null when the eligible pool is empty.
 */
export function pickRandom(items: Item[], excludeId?: string): Item | null {
  const pool = excludeId ? items.filter((item) => item.id !== excludeId) : items;
  if (pool.length === 0) return null;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
