/**
 * NotificationBadge – small red count pill for unread/pending indicators.
 *
 * Two render modes:
 *   - inline (default): sits in the normal layout flow, used next to menu
 *     labels like "Friends".
 *   - floating: absolutely positioned top-right of a relatively-positioned
 *     parent, used to overlay an icon button (e.g. the gear).
 *
 * Returns null when count is 0 so callers can render it unconditionally.
 */

import { cn } from "./utils";

interface NotificationBadgeProps {
  count: number;
  variant?: "inline" | "floating";
  className?: string;
}

const BASE_CLASS =
  "min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none";

const FLOATING_POSITION_CLASS = "absolute -top-1 -right-1 pointer-events-none";

export function NotificationBadge({ count, variant = "inline", className }: NotificationBadgeProps) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={cn(BASE_CLASS, variant === "floating" && FLOATING_POSITION_CLASS, className)}
      aria-label={`${count} pending`}
    >
      {label}
    </span>
  );
}
