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

const DOT_GLOW_STYLE = {
  backgroundColor: "#fffbe6",
  boxShadow:
    "0 0 2px 1px rgba(255, 255, 200, 1), 0 0 4px 2px rgba(253, 224, 71, 1), 0 0 8px 3px rgba(250, 204, 21, 1)",
};

const FLOATING_POSITION_CLASS = "absolute -bottom-1 -right-1 pointer-events-none";

export function NotificationBadge({
  count,
  variant = "inline",
  dot = false,
  className,
}: NotificationBadgeProps) {
  if (count <= 0) return null;
  const base = dot ? DOT_CLASS : COUNT_CLASS;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={cn(base, variant === "floating" && FLOATING_POSITION_CLASS, className)}
      style={dot ? DOT_GLOW_STYLE : undefined}
      aria-label={`${count} pending`}
    >
      {dot ? null : label}
    </span>
  );
}
