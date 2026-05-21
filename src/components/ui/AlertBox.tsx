/**
 * AlertBox – translucent rounded pill for inline error/warning/info
 * messages on the auth pages (and anywhere else that needs the same
 * look). Variants share container/border styling and differ only in
 * colour family.
 *
 *   <AlertBox variant="error">Sign in failed</AlertBox>
 */

import type { ReactNode } from "react";
import { cn } from "./utils";

export type AlertVariant = "error" | "warning" | "info";

interface AlertBoxProps {
  variant: AlertVariant;
  children: ReactNode;
  className?: string;
}

// Container colour, border colour, text colour — one row per variant.
const VARIANT_CLASS: Record<AlertVariant, { container: string; text: string }> = {
  error: {
    container: "bg-red-500/10 border-red-500/20",
    text: "text-red-400",
  },
  warning: {
    container: "bg-yellow-500/10 border-yellow-500/20",
    // Warning text is intentionally white on the dark sign-in background —
    // matches the lost-password notice the user wanted highly visible.
    text: "text-white",
  },
  info: {
    container: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
  },
};

export function AlertBox({ variant, children, className }: AlertBoxProps) {
  const styles = VARIANT_CLASS[variant];
  return (
    <div className={cn("rounded-lg border p-3", styles.container, className)}>
      <p className={cn("text-sm", styles.text)}>{children}</p>
    </div>
  );
}
