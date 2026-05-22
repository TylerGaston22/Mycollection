/**
 * Centralised styling constants for the friend-system UI.
 * Per the project's no-duplicate-styling rule, every className that
 * could be reused inside the friends/ folder lives here.
 */

export const FRIEND_ROW_CLASS =
  "flex items-center justify-between gap-3 px-3 py-2";

export const FRIEND_ROW_NAME_CLASS = "font-medium truncate text-white";
export const FRIEND_ROW_USERNAME_CLASS = "text-sm text-white/70 truncate";

export const FRIEND_EMPTY_STATE_CLASS =
  "text-center py-8 text-sm text-white/70";

// Each tab in the FriendsDialog: white text + icon when idle, flips to
// a white pill with black text/icon when active. Backed by a CSS rule
// in src/styles/index.css (Tailwind JIT isn't enabled in this project,
// so `!`-modifier utilities can't be used).
export const FRIEND_TAB_TRIGGER_CLASS = "friend-tab-trigger";

// Text inputs inside the FriendsDialog (e.g. the Find tab search box):
// translucent dark fill + white text + faded white placeholder so the
// input is legible on the navy dialog surface. Also backed by a CSS
// rule in src/styles/index.css.
export const FRIEND_INPUT_CLASS = "friend-input";
