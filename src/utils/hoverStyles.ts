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
 *  - `hover:bg-page-surface` lifts items with no inline background (most
 *    nav rows, transparent dialog rows). The page-surface token is white/10
 *    on dark themes and beige on the Coffee light theme.
 *  - `hover:brightness-110` lifts items WITH an opaque inline
 *    background (e.g. the sidebar CategoryButton's navy gradient),
 *    where the bg-color overlay would otherwise be hidden underneath. */
export const NAV_HOVER_CLASS = "hover:bg-page-surface hover:brightness-110 transition-all";

/** For dense layouts (table rows in ListView) where many rows are
 *  visible at once and a stronger overlay would feel noisy. Lighter than
 *  NAV_HOVER_CLASS, and token-driven so it adapts to the active surface. */
export const ROW_HOVER_CLASS = "hover:bg-page-surface-subtle transition-colors";
