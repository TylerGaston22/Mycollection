/**
 * usePreferences – per-user theme/background colour preferences.
 * Stores a colour theme ID for each built-in content type and
 * syncs the selection to localStorage.
 */

import { useState, useEffect } from 'react';

const DEFAULT_BACKGROUND_COLORS = {
  movie: 'current',
  'tv-show': 'current',
  restaurant: 'current',
  place: 'current',
};

export function usePreferences(currentUserId: string) {
  const [backgroundColors, setBackgroundColors] = useState(DEFAULT_BACKGROUND_COLORS);

  useEffect(() => {
    const stored = localStorage.getItem(`backgroundColors-${currentUserId}`);
    setBackgroundColors(stored ? JSON.parse(stored) : DEFAULT_BACKGROUND_COLORS);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(`backgroundColors-${currentUserId}`, JSON.stringify(backgroundColors));
  }, [backgroundColors, currentUserId]);

  return { backgroundColors, setBackgroundColors };
}
