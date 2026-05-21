/**
 * ThemePrimaryButton – an accent-coloured action button (the "+ Add Item",
 * dialog submit, etc.). Wraps Button so the repeated
 *
 *   <Button style={{ backgroundColor: currentTheme.accentColor }}
 *           className="text-white hover:opacity-90">
 *
 * pattern lives in one place. `currentTheme` is optional: when omitted the
 * component falls back to a plain default Button, so callers that don't
 * always have a theme (e.g. some dialog footers) can use the same component.
 */

import type { ComponentProps, CSSProperties } from "react";
import { Button } from "./button";
import { cn } from "./utils";
import type { ThemeConfig } from "../../utils/themeConfig";

interface ThemePrimaryButtonProps extends ComponentProps<typeof Button> {
  currentTheme?: ThemeConfig;
}

export function ThemePrimaryButton({
  currentTheme,
  className,
  style,
  ...buttonProps
}: ThemePrimaryButtonProps) {
  const themeStyle: CSSProperties | undefined = currentTheme
    ? { backgroundColor: currentTheme.accentColor }
    : undefined;

  return (
    <Button
      // Caller-supplied inline style wins if it sets the same property.
      style={{ ...themeStyle, ...style }}
      className={cn(currentTheme && "text-white hover:opacity-90", className)}
      {...buttonProps}
    />
  );
}
