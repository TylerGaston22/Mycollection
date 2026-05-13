/**
 * Shared constants — content types, statuses, storage key builders.
 * Import from here instead of hardcoding these strings.
 */

export const CONTENT_TYPES = ['item', 'tv-show', 'restaurant', 'place'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const ITEM_STATUSES = ['watched', 'want-to-see'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const DEFAULT_CONTENT_TYPE: ContentType = 'item';
export const DEFAULT_STATUS: ItemStatus = 'want-to-see';

export const RATING_MIN = 1;
export const RATING_MAX = 5;

export const STORAGE_KEYS = {
  items: (userId: string) => `items-${userId}`,
  customTabs: (userId: string) => `customTabs-${userId}`,
  customSections: (userId: string) => `customSections-${userId}`,
  backgroundColors: (userId: string) => `backgroundColors-${userId}`,
} as const;
