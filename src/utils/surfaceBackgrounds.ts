/**
 * Site-wide surface background constants.
 * Centralised so a single tweak propagates across every dialog,
 * dropdown, button, and avatar surface that uses them.
 */

/** Raised-surface background for idle surfaces (dialogs, dropdowns, inactive
 *  category buttons). Resolves to the `--surface-bg` CSS token so it flips with
 *  the active surface theme: navy on the default/dark themes, warm espresso
 *  brown under the Coffee theme. Defined in src/styles/index.css. */
export const SURFACE_BACKGROUND = "var(--surface-bg)";
