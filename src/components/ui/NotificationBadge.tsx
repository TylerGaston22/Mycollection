/**
 * NotificationBadge – orange indicator for unread/pending counts.
 *
 * Three render modes (combine variant + dot as needed):
 *   - variant="inline" (default): sits in normal layout flow, used next to
 *     menu labels like "Friends" / "Requests".
 *   - variant="floating": absolutely positioned bottom-right of a relatively-
 *     positioned parent, used to overlay an icon button (e.g. the gear).
 *   - dot=true: render a small solid circle with a soft glow halo — for
 *     at-a-glance "you have something" indicators where the exact count
 *     isn't useful.
 *
 * Returns null when count is 0 so callers can render it unconditionally.
 */

import type { CSSProperties } from "react";
import { cn } from "./utils";

interface NotificationBadgeProps {
  count: number;
  variant?: "inline" | "floating";
  dot?: boolean;
  className?: string;
}

const COUNT_CLASS =
  "min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none";

const DOT_CLASS = "w-2.5 h-2.5 rounded-full inline-block";

// Many tight shadow stops at full opacity stack additively for maximum
// luminance without expanding the visual footprint past ~10px.
const DOT_GLOW_STYLE = {
  backgroundColor: "#ffffff",
  boxShadow: [
    "0 0 1px 1px rgba(255, 255, 255, 1)",
    "0 0 2px 1px rgba(255, 250, 180, 1)",
    "0 0 3px 2px rgba(255, 235, 100, 1)",
    "0 0 5px 2px rgba(253, 224, 71, 1)",
    "0 0 8px 3px rgba(250, 204, 21, 1)",
  ].join(", "),
};

const FLOATING_POSITION_CLASS = "absolute pointer-events-none";
const FLOATING_POSITION_STYLE = { bottom: "0px", right: "0px" };

export function NotificationBadge({
  count,
  variant = "inline",
  dot = false,
  className,
}: NotificationBadgeProps) {
  if (count <= 0) return null;
  const base = dot ? DOT_CLASS : COUNT_CLASS;
  const label = count > 99 ? "99+" : String(count);
  const style: CSSProperties = {
    ...(dot ? DOT_GLOW_STYLE : null),
    ...(variant === "floating" ? FLOATING_POSITION_STYLE : null),
  };
  return (
    <span
      className={cn(base, variant === "floating" && FLOATING_POSITION_CLASS, className)}
      style={Object.keys(style).length > 0 ? style : undefined}
      aria-label={`${count} pending`}
    >
      {dot ? null : label}
    </span>
  );
}
