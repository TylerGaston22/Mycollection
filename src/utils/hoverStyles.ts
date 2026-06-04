/**
 * Centralised hover-state class strings.
 * One source of truth for the app's "you can click this" feedback so
 * any future tweak (intensity, transition, accent indicator) only
 * happens in one place.
 */

/** For navigation items and other prominent clickable rows on dark
 *  surfaces — sidebar categories/subcategories, gear-menu items,
 *  dialog rows. Subtle white overlay so it reads as a lift, not a
 *  colour change. */
export const NAV_HOVER_CLASS = "hover:bg-white/10 transition-colors";

/** For dense layouts (table rows in ListView) where many rows are
 *  visible at once and a stronger overlay would feel noisy. Half the
 *  intensity of NAV_HOVER_CLASS. */
export const ROW_HOVER_CLASS = "hover:bg-white/5 transition-colors";
