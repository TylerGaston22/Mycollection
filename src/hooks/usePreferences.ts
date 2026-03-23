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
