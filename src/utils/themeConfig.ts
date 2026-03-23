export interface ThemeConfig {
  id: string;
  name: string;
  sidebarGradient: string;
  backgroundGradient: string;
  accentColor: string;
  isCustom?: boolean;
}

export const colorThemes: Record<string, ThemeConfig> = {
  current: {
    id: 'current',
    name: 'Current (Ghibli)',
    sidebarGradient: 'linear-gradient(to bottom, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))',
    backgroundGradient: 'linear-gradient(to bottom right, rgb(2, 6, 23), rgb(23, 37, 84), rgb(59, 7, 100))',
    accentColor: 'rgb(249, 115, 22)' // orange-500
  },
  purple: {
    id: 'purple',
    name: 'Purple Dream',
    sidebarGradient: 'linear-gradient(to bottom, rgb(88, 28, 135), rgb(126, 34, 206), rgb(88, 28, 135))',
    backgroundGradient: 'linear-gradient(to bottom right, rgb(59, 7, 100), rgb(107, 33, 168), rgb(126, 34, 206))',
    accentColor: 'rgb(232, 121, 249)' // fuchsia-400 - bright pink-purple
  },
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    sidebarGradient: 'linear-gradient(to bottom, rgb(12, 74, 110), rgb(7, 89, 133), rgb(12, 74, 110))',
    backgroundGradient: 'linear-gradient(to bottom right, rgb(3, 7, 18), rgb(12, 74, 110), rgb(7, 89, 133))',
    accentColor: 'rgb(34, 211, 238)' // cyan-400 - bright cyan
  },
  green: {
    id: 'green',
    name: 'Forest Green',
    sidebarGradient: 'linear-gradient(to bottom, rgb(20, 83, 45), rgb(22, 101, 52), rgb(20, 83, 45))',
    backgroundGradient: 'linear-gradient(to bottom right, rgb(2, 6, 23), rgb(20, 83, 45), rgb(5, 46, 22))',
    accentColor: 'rgb(163, 230, 53)' // lime-400 - bright lime green
  },
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    sidebarGradient: 'linear-gradient(to bottom, rgb(124, 45, 18), rgb(154, 52, 18), rgb(124, 45, 18))',
    backgroundGradient: 'linear-gradient(to bottom right, rgb(23, 6, 2), rgb(124, 45, 18), rgb(127, 29, 29))',
    accentColor: 'rgb(253, 224, 71)' // yellow-300 - warm yellow
  },
  teal: {
    id: 'teal',
    name: 'Teal Wave',
    sidebarGradient: 'linear-gradient(to bottom, rgb(17, 94, 89), rgb(15, 118, 110), rgb(17, 94, 89))',
    backgroundGradient: 'linear-gradient(to bottom right, rgb(2, 6, 23), rgb(17, 94, 89), rgb(7, 89, 133))',
    accentColor: 'rgb(45, 212, 191)' // teal-400 - bright turquoise
  },
  pink: {
    id: 'pink',
    name: 'Sakura Pink',
    sidebarGradient: 'linear-gradient(to bottom, rgb(131, 24, 67), rgb(157, 23, 77), rgb(131, 24, 67))',
    backgroundGradient: 'linear-gradient(to bottom right, rgb(23, 2, 13), rgb(131, 24, 67), rgb(159, 18, 57))',
    accentColor: 'rgb(244, 114, 182)' // pink-400 - bright pink
  },
  indigo: {
    id: 'indigo',
    name: 'Midnight Indigo',
    sidebarGradient: 'linear-gradient(to bottom, rgb(55, 48, 163), rgb(67, 56, 202), rgb(55, 48, 163))',
    backgroundGradient: 'linear-gradient(to bottom right, rgb(3, 7, 18), rgb(55, 48, 163), rgb(88, 28, 135))',
    accentColor: 'rgb(167, 139, 250)' // violet-400 - bright lavender
  },
};

export function getTheme(themeId: string): ThemeConfig {
  return colorThemes[themeId] || colorThemes.current;
}

// Helper function to convert color to rgba with opacity
export function colorToRgba(color: string, opacity: number): string {
  // If already rgb format
  if (color.startsWith('rgb(')) {
    const values = color.match(/\d+/g);
    if (values && values.length === 3) {
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
    }
  }
  // If hex format
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Fallback
  return color;
}

export function createCustomTheme(
  categoryType: string,
  sidebarColor: string,
  backgroundGradientColor: string,
  accentColor: string
): ThemeConfig {
  const id = `custom-${categoryType}`;
  const name = `Custom ${categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}`;
  
  return {
    id,
    name,
    sidebarGradient: `linear-gradient(to bottom, ${sidebarColor}, ${sidebarColor}dd, ${sidebarColor})`,
    backgroundGradient: `linear-gradient(to bottom right, ${sidebarColor}, ${backgroundGradientColor}, #000000)`,
    accentColor,
    isCustom: true
  };
}

export function registerCustomTheme(theme: ThemeConfig): void {
  colorThemes[theme.id] = theme;
}

export function deleteCustomTheme(themeId: string): void {
  if (colorThemes[themeId]?.isCustom) {
    delete colorThemes[themeId];
  }
}