/**
 * usePreferences – per-user theme/background colour preferences.
 * Demo user: localStorage persistence.
 * Supabase user: database persistence.
 */

import { useState, useEffect } from 'react';
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
  const storageKey = STORAGE_KEYS.backgroundColors(currentUserId);

  useEffect(() => {
    if (isDemoUser) {
      setBackgroundColors(loadDemoData(storageKey, DEFAULT_BACKGROUND_COLORS));
    } else {
      loadPreferences();
    }
  }, [currentUserId, isDemoUser, storageKey]);

  useDemoSync(storageKey, backgroundColors, isDemoUser);

  const loadPreferences = async () => {
    const { data } = await supabase
      .from('preferences')
      .select('background_colors')
      .eq('user_id', currentUserId)
      .single();

    if (data) {
      setBackgroundColors(data.background_colors as typeof DEFAULT_BACKGROUND_COLORS);
    } else {
      setBackgroundColors(DEFAULT_BACKGROUND_COLORS);
    }
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
            console.error('Failed to save preferences:', error.message);
          }
        });
    }
  };

  return { backgroundColors, setBackgroundColors: updateBackgroundColors };
}
