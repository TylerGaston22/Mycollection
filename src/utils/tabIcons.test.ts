import { describe, it, expect } from 'vitest';
import { Star, Trophy, Gamepad2 } from 'lucide-react';
import { getTabIcon, TAB_ICONS, DEFAULT_TAB_ICON_NAME } from './tabIcons';

describe('getTabIcon', () => {
  it('resolves a stored name to its component', () => {
    expect(getTabIcon('Trophy')).toBe(Trophy);
    expect(getTabIcon('Gamepad2')).toBe(Gamepad2);
  });

  // The original bug: the sidebar hardcoded Star and ignored tab.icon
  // entirely, so every custom category rendered as a star regardless of
  // what the user picked.
  it('resolves every name the picker can produce', () => {
    for (const option of TAB_ICONS) {
      expect(getTabIcon(option.name)).toBe(option.icon);
    }
  });

  it('falls back to Star for an unknown name', () => {
    expect(getTabIcon('NotARealIcon')).toBe(Star);
  });

  it('falls back to Star for missing values', () => {
    expect(getTabIcon(undefined)).toBe(Star);
    expect(getTabIcon(null)).toBe(Star);
    expect(getTabIcon('')).toBe(Star);
  });

  it('has a default name that exists in the registry', () => {
    expect(TAB_ICONS.some((option) => option.name === DEFAULT_TAB_ICON_NAME)).toBe(true);
  });

  it('has no duplicate names', () => {
    const names = TAB_ICONS.map((option) => option.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
