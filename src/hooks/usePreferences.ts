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

const DEFAULT_BACKGROUND_COLORS = {
  item: 'current',
  'tv-show': 'current',
  restaurant: 'current',
  place: 'current',
};

export function usePreferences(currentUserId: string, isDemoUser: boolean) {
  const [backgroundColors, setBackgroundColors] = useState(DEFAULT_BACKGROUND_COLORS);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);
  const storageKey = STORAGE_KEYS.backgroundColors(currentUserId);
  const isLoading = !isDemoUser && loadedForUserId !== currentUserId;

  useEffect(() => {
    if (isDemoUser) {
      setBackgroundColors(loadDemoData(storageKey, DEFAULT_BACKGROUND_COLORS));
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
      setBackgroundColors(data.background_colors as typeof DEFAULT_BACKGROUND_COLORS);
    } else {
      setBackgroundColors(DEFAULT_BACKGROUND_COLORS);
    }
    setLoadedForUserId(currentUserId);
  };

  // Wrap setBackgroundColors to also persist to Supabase
  const updateBackgroundColors = (colors: typeof DEFAULT_BACKGROUND_COLORS) => {
    setBackgroundColors(colors);

    if (!isDemoUser) {
      supabase
        .from('preferences')
        .upsert({ user_id: currentUserId, background_colors: colors, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) {
            toast.error('Failed to save preferences', { description: error.message });
          }
        });
    }
  };

  return { backgroundColors, setBackgroundColors: updateBackgroundColors, isLoading };
}
