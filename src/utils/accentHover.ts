/**
 * Helpers for the "fade the accent colour in on hover" pattern used
 * throughout the sidebar / main content header buttons. Centralised so
 * a single tweak (e.g. swapping the fade opacity) propagates everywhere.
 *
 * Returns `onMouseEnter` / `onMouseLeave` handlers ready to spread onto
 * a Button:
 *
 *   <Button {...accentColorHoverHandlers(currentTheme)} />
 */

import type React from "react";
import { type ThemeConfig, colorToRgba } from "./themeConfig";

interface AccentHoverOptions {
  /** Opacity for the resting (non-hover) state. */
  restingOpacity?: number;
  /** When true, also swap background-color (transparent → light translucent). */
  withBackground?: boolean;
}

/**
 * Toggle the element's `color` (text/icon colour) between a faded accent
 * (resting) and the full accent (hover). Optionally also toggles a
 * subtle translucent slate background on hover.
 */
export function accentColorHoverHandlers(
  theme: ThemeConfig,
  options: AccentHoverOptions = {},
): {
  onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
} {
  const restingOpacity = options.restingOpacity ?? 0.7;
  return {
    onMouseEnter: (event) => {
      event.currentTarget.style.color = theme.accentColor;
      if (options.withBackground) {
        event.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.5)";
      }
    },
    onMouseLeave: (event) => {
      event.currentTarget.style.color = colorToRgba(theme.accentColor, restingOpacity);
      if (options.withBackground) {
        event.currentTarget.style.backgroundColor = "transparent";
      }
    },
  };
}

/**
 * Variant used by the sidebar action buttons: fade a subtle accent-color
 * gradient on hover, restore transparent/white on leave. Keeps text white
 * by default (these buttons live on a dark sidebar).
 */
export function accentGradientHoverHandlers(theme: ThemeConfig): {
  onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: (event: React.MouseEvent<HTMLElement>) => void;
} {
  return {
    onMouseEnter: (event) => {
      event.currentTarget.style.background = `linear-gradient(to right, ${colorToRgba(
        theme.accentColor,
        0.2,
      )}, ${colorToRgba(theme.accentColor, 0.1)})`;
      event.currentTarget.style.color = theme.accentColor;
    },
    onMouseLeave: (event) => {
      event.currentTarget.style.background = "transparent";
      event.currentTarget.style.color = "white";
    },
  };
}
