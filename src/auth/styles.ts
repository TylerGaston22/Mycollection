/**
 * Auth-form styling constants.
 *
 * Every input / card on the SignInPage, ResetPasswordPage (and any
 * future auth screens) imports its className from here so a visual
 * tweak only ever needs to happen in one file.
 *
 * Conventions:
 *   - These pages render on a hardcoded dark background, so colours
 *     are explicit (not theme tokens).
 *   - Focus state is intentionally identical to resting state — the
 *     caret indicates focus; we don't want a coloured border/ring
 *     shifting when the user types or clicks. The `focus-visible:*`
 *     overrides are essential because the base Input component
 *     applies `--ring`-coloured focus styling by default.
 *   - The browser autofill background tint is killed via a global
 *     CSS rule in src/styles/index.css.
 */

export const AUTH_INPUT_CLASS =
  "mt-2 " +
  "bg-white/5 border-white/10 text-white placeholder:text-gray-500 " +
  // Lock focus visuals to the resting style so clicking/typing
  // doesn't paint a coloured ring or border.
  "focus:border-white/10 focus:ring-0 focus:outline-none " +
  "focus-visible:border-white/10 focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-none";

export const AUTH_CARD_CLASS =
  "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl";
