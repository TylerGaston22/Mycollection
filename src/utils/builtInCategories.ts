/**
 * Built-in category metadata — the single source of truth for the
 * id / label / icon of each built-in content type. Sidebar and
 * MobileBottomNav both render this list (previously each kept its own
 * near-identical copy — the only difference was Mobile showed "Food"
 * for restaurants where Sidebar showed "Restaurants"; we keep both
 * here as `label` + `shortLabel` so neither component duplicates).
 *
 * Adding a new built-in category → add one entry here, both chrome
 * surfaces pick it up automatically. Per-type field labels (Watched
 * vs Played, etc.) still live in contentHelpers.ts.
 */

import {
  Film,
  Tv,
  UtensilsCrossed,
  MapPin,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

export interface BuiltInCategory {
  id: string;
  /** Full label — used in the desktop sidebar. */
  label: string;
  /** Shorter label for tight contexts like the mobile bottom-nav
   *  (where "Restaurants" doesn't fit). Defaults to `label` when there
   *  is no shorter form. */
  shortLabel: string;
  icon: LucideIcon;
}

export const BUILT_IN_CATEGORIES: BuiltInCategory[] = [
  { id: "item", label: "Movies", shortLabel: "Movies", icon: Film },
  { id: "tv-show", label: "TV Shows", shortLabel: "TV Shows", icon: Tv },
  { id: "restaurant", label: "Restaurants", shortLabel: "Food", icon: UtensilsCrossed },
  { id: "place", label: "Places", shortLabel: "Places", icon: MapPin },
  { id: "game", label: "Games", shortLabel: "Games", icon: Gamepad2 },
];
