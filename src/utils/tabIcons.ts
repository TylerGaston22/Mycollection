/**
 * Custom-tab icon registry — the single source of truth mapping the icon
 * NAME stored in `custom_tabs.icon` to the Lucide component that renders
 * it.
 *
 * The name is what lives in the database (a plain string like "Trophy");
 * the component can't be persisted. Anything that renders a custom tab
 * has to resolve one to the other, so that resolution lives here rather
 * than in each chrome surface.
 *
 * Same shape and intent as builtInCategories.ts: add an entry here and
 * the picker, the sidebar, and the mobile nav all pick it up.
 */

import {
  BookOpen,
  Coffee,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Lightbulb,
  Music,
  Palette,
  Plane,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface TabIconOption {
  /** Persisted in custom_tabs.icon. Never change an existing name — rows
   *  already reference it and would silently fall back to the default. */
  name: string;
  icon: LucideIcon;
  /** Shown under the icon in the picker. */
  label: string;
}

export const TAB_ICONS: TabIconOption[] = [
  { name: "BookOpen", icon: BookOpen, label: "Book" },
  { name: "Coffee", icon: Coffee, label: "Coffee" },
  { name: "Dumbbell", icon: Dumbbell, label: "Fitness" },
  { name: "Gamepad2", icon: Gamepad2, label: "Games" },
  { name: "GraduationCap", icon: GraduationCap, label: "Education" },
  { name: "Heart", icon: Heart, label: "Heart" },
  { name: "Home", icon: Home, label: "Home" },
  { name: "Lightbulb", icon: Lightbulb, label: "Ideas" },
  { name: "Music", icon: Music, label: "Music" },
  { name: "Palette", icon: Palette, label: "Art" },
  { name: "Plane", icon: Plane, label: "Travel" },
  { name: "ShoppingBag", icon: ShoppingBag, label: "Shopping" },
  { name: "Sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "Star", icon: Star, label: "Star" },
  { name: "Trophy", icon: Trophy, label: "Trophy" },
  { name: "Zap", icon: Zap, label: "Zap" },
];

/** Matches the `default 'Star'` on custom_tabs.icon in schema.sql. */
export const DEFAULT_TAB_ICON_NAME = "Star";

const ICON_BY_NAME = new Map(TAB_ICONS.map((option) => [option.name, option.icon]));

/**
 * Resolve a stored icon name to its component, falling back to Star for
 * an unknown or missing name. The fallback matters for rows written
 * before an icon was removed from TAB_ICONS, and for tabs imported from
 * a backup file whose icon name we don't recognise.
 */
export function getTabIcon(name: string | undefined | null): LucideIcon {
  if (!name) return Star;
  return ICON_BY_NAME.get(name) ?? Star;
}
