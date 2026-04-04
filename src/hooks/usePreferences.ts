/**
 * usePreferences – per-user theme/background colour preferences.
 * Demo user: localStorage persistence.
 * Supabase user: database persistence.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_BACKGROUND_COLORS = {
  movie: 'current',
  'tv-show': 'current',
  restaurant: 'current',
  place: 'current',
};

export function usePreferences(currentUserId: string, isDemoUser: boolean) {
  const [backgroundColors, setBackgroundColors] = useState(DEFAULT_BACKGROUND_COLORS);

  useEffect(() => {
    if (isDemoUser) {
      const saved = localStorage.getItem(`backgroundColors-${currentUserId}`);
      if (saved) {
        setBackgroundColors(JSON.parse(saved));
      } else {
        setBackgroundColors(DEFAULT_BACKGROUND_COLORS);
      }
    } else {
      loadPreferences();
    }
  }, [currentUserId, isDemoUser]);

  // Persist for demo users
  useEffect(() => {
    if (isDemoUser) {
      localStorage.setItem(`backgroundColors-${currentUserId}`, JSON.stringify(backgroundColors));
    }
  }, [backgroundColors, currentUserId, isDemoUser]);

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
