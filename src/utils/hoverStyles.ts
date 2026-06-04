/**
 * Centralised hover-state class strings.
 * One source of truth for the app's "you can click this" feedback so
 * any future tweak (intensity, transition, accent indicator) only
 * happens in one place.
 */

/** For navigation items and other prominent clickable rows on dark
 *  surfaces — sidebar categories/subcategories, gear-menu items,
 *  dialog rows. Two effects stacked so the hover reads on both kinds
 *  of surface:
 *  - `hover:bg-white/10` lifts items with no inline background (most
 *    nav rows, transparent dialog rows).
 *  - `hover:brightness-110` lifts items WITH an opaque inline
 *    background (e.g. the sidebar CategoryButton's navy gradient),
 *    where the bg-color overlay would otherwise be hidden underneath. */
export const NAV_HOVER_CLASS = "hover:bg-white/10 hover:brightness-110 transition-all";

/** For dense layouts (table rows in ListView) where many rows are
 *  visible at once and a stronger overlay would feel noisy. Half the
 *  intensity of NAV_HOVER_CLASS. */
export const ROW_HOVER_CLASS = "hover:bg-white/5 transition-colors";
