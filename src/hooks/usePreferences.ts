/**
 * usePreferences – per-user theme/background colour preferences.
 * Demo user: localStorage persistence.
 * Supabase user: database persistence.
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { loadDemoData, useDemoSync } from '../demo';
import { STORAGE_KEYS } from '../constants';
import { handleSupabaseError } from '../utils/toastError';

/** Full shape of the per-user preferences blob. Consumers that mutate
 *  it (SettingsDialog) should import this type rather than redeclaring
 *  a narrower one. */
export type BackgroundColorsState = {
  item: string;
  'tv-show': string;
  restaurant: string;
  place: string;
  surfaceTheme: string;
  visibleCategories: Record<string, boolean>;
};

/** Keys in BackgroundColorsState that hold a per-category theme id
 *  (string). Excludes `surfaceTheme` (app-wide) and `visibleCategories`
 *  (a map, not a theme id). `getCategoryThemeId` below uses this to
 *  bound the runtime index lookup — without that narrowing, indexing
 *  with a plain `string` from the call site could return the
 *  visibleCategories map and silently break consumers. */
const PER_CATEGORY_THEME_KEYS = ['item', 'tv-show', 'restaurant', 'place'] as const;
type PerCategoryThemeKey = typeof PER_CATEGORY_THEME_KEYS[number];

/** Resolve the theme id for a content type. Custom tabs and unknown
 *  ids fall back to 'current'. Centralised here so App.tsx (and any
 *  future caller) doesn't have to repeat the narrowing dance. */
export function getCategoryThemeId(
  bg: BackgroundColorsState,
  contentType: string,
): string {
  if (!(PER_CATEGORY_THEME_KEYS as readonly string[]).includes(contentType)) {
    return 'current';
  }
  return bg[contentType as PerCategoryThemeKey] || 'current';
}

/** Normalise a raw `surfaceTheme` value from storage. The theme was
 *  originally called 'bookstore'; we renamed it to 'coffee' but old
 *  user data still carries the legacy string. Map either to 'coffee'
 *  here so the rest of the app only ever sees the new value. The next
 *  save will persist 'coffee' and the legacy value disappears. */
function normaliseSurfaceTheme(raw: unknown): string {
  if (raw === 'bookstore') return 'coffee';
  if (typeof raw === 'string') return raw;
  return 'default';
}

const DEFAULT_BACKGROUND_COLORS: BackgroundColorsState = {
  item: 'current',
  'tv-show': 'current',
  restaurant: 'current',
  place: 'current',
  // App-wide surface override, independent of the per-content-type themes
  // above. 'default' = use the per-category theme; 'coffee' = force the
  // light Coffee theme everywhere (incl. custom tabs). Stored as a sibling
  // key in the same JSONB blob, so no schema change is needed.
  surfaceTheme: 'default',
  // Per-user visibility flags for the built-in categories. Sidebar +
  // MobileBottomNav filter their lists by this map. Default: every
  // category visible. Stored as another sibling key in the same JSONB
  // blob — no schema change.
  visibleCategories: {
    item: true,
    'tv-show': true,
    restaurant: true,
    place: true,
    game: true,
  } as Record<string, boolean>,
};

export function usePreferences(currentUserId: string, isDemoUser: boolean) {
  const [backgroundColors, setBackgroundColors] = useState(DEFAULT_BACKGROUND_COLORS);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);
  const storageKey = STORAGE_KEYS.backgroundColors(currentUserId);
  const isLoading = !isDemoUser && loadedForUserId !== currentUserId;

  useEffect(() => {
    if (isDemoUser) {
      // Demo data lives in localStorage and predates the visibleCategories
      // key (and any future additions). Merge with defaults — same shape as
      // the Supabase path below — so consumers can read every key safely.
      const stored = loadDemoData<Partial<BackgroundColorsState>>(
        storageKey,
        DEFAULT_BACKGROUND_COLORS,
      );
      setBackgroundColors({
        ...DEFAULT_BACKGROUND_COLORS,
        ...stored,
        surfaceTheme: normaliseSurfaceTheme(stored.surfaceTheme),
        visibleCategories: {
          ...DEFAULT_BACKGROUND_COLORS.visibleCategories,
          ...(stored.visibleCategories ?? {}),
        },
      });
      setLoadedForUserId(currentUserId);
    } else {
      setBackgroundColors(DEFAULT_BACKGROUND_COLORS);
      loadPreferences();
    }
  }, [currentUserId, isDemoUser, storageKey]);

  useDemoSync(storageKey, backgroundColors, isDemoUser);

  const loadPreferences = async () => {
    const { data, error } = await supabase
      .from('preferences')
      .select('background_colors')
      .eq('user_id', currentUserId)
      .single();

    // PGRST116 = "no rows" — expected for new users who haven't saved
    // preferences yet, fall through to defaults without toasting.
    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to load preferences', { description: error.message });
    }

    if (data) {
      // Merge over defaults so rows saved before a key existed (e.g.
      // surfaceTheme) still deserialise with every field present. The
      // visibleCategories sub-map needs its own shallow merge so adding
      // a new built-in category later doesn't drop the user's stored
      // toggles for the others.
      const saved = data.background_colors as Partial<typeof DEFAULT_BACKGROUND_COLORS>;
      setBackgroundColors({
        ...DEFAULT_BACKGROUND_COLORS,
        ...saved,
        surfaceTheme: normaliseSurfaceTheme(saved.surfaceTheme),
        visibleCategories: {
          ...DEFAULT_BACKGROUND_COLORS.visibleCategories,
          ...(saved.visibleCategories ?? {}),
        },
      });
    } else {
      setBackgroundColors(DEFAULT_BACKGROUND_COLORS);
    }
    setLoadedForUserId(currentUserId);
  };

  // Wrap setBackgroundColors to also persist to Supabase
  const updateBackgroundColors = (colors: BackgroundColorsState) => {
    setBackgroundColors(colors);

    if (!isDemoUser) {
      supabase
        .from('preferences')
        .upsert({ user_id: currentUserId, background_colors: colors, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          handleSupabaseError('Failed to save preferences', error);
        });
    }
  };

  return { backgroundColors, setBackgroundColors: updateBackgroundColors, isLoading };
}
