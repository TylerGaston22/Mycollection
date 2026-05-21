/**
 * DecorativeIconBox – the small coloured-background icon tile used in
 * decorative rows (e.g. the four content-type icons under the SignInPage
 * heading). One component, callers pick the colour family.
 *
 *   <DecorativeIconBox color="orange" icon={Film} />
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "./utils";

export type DecorativeIconColor = "orange" | "purple" | "blue" | "green";

interface DecorativeIconBoxProps {
  color: DecorativeIconColor;
  icon: LucideIcon;
  className?: string;
}

// Background / icon-colour pair per supported colour family.
const COLOR_CLASS: Record<
  DecorativeIconColor,
  { background: string; icon: string }
> = {
  orange: { background: "bg-orange-500/10", icon: "text-orange-400" },
  purple: { background: "bg-purple-500/10", icon: "text-purple-400" },
  blue: { background: "bg-blue-500/10", icon: "text-blue-400" },
  green: { background: "bg-green-500/10", icon: "text-green-400" },
};

export function DecorativeIconBox({ color, icon: Icon, className }: DecorativeIconBoxProps) {
  const styles = COLOR_CLASS[color];
  return (
    <div className={cn("p-2 rounded-lg", styles.background, className)}>
      <Icon className={cn("h-5 w-5", styles.icon)} />
    </div>
  );
}
