/**
 * Theme configuration and colour palette definitions.
 * Each theme provides sidebar/background gradients and an accent colour
 * that are applied per content-type via user preferences.
 */

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
  // Warm, LIGHT theme from the coffeecode palette. Unlike the other
  // (dark) themes, its gradients are cream/beige so the sidebar and page read
  // as a light surface; the page-chrome text flips to dark-brown via the
  // [data-surface="coffee"] token override in index.css.
  coffee: {
    id: 'coffee',
    name: 'Coffee',
    sidebarGradient: 'linear-gradient(to bottom, hsl(36, 33%, 95%), hsl(33, 35%, 92%), hsl(32, 30%, 90%))',
    backgroundGradient: 'linear-gradient(to bottom right, hsl(36, 33%, 97%), hsl(33, 35%, 94%), hsl(36, 30%, 92%))',
    accentColor: 'hsl(28, 32%, 38%)' // warm brown (coffeecode primary) — drives active buttons, headings, avatar; pair with cream --page-on-accent text
  },
};

export function getTheme(themeId: string): ThemeConfig {
  const matchingTheme = colorThemes[themeId];
  if (matchingTheme) {
    return matchingTheme;
  }
  return colorThemes.current;
}

// Helper function to convert color to rgba with opacity
export function colorToRgba(color: string, opacity: number): string {
  // If already rgb format
  if (color.startsWith('rgb(')) {
    // Extract the three numeric R/G/B values from an "rgb(r, g, b)" string
    const rgbNumberValues = color.match(/\d+/g);
    if (rgbNumberValues && rgbNumberValues.length === 3) {
      return `rgba(${rgbNumberValues[0]}, ${rgbNumberValues[1]}, ${rgbNumberValues[2]}, ${opacity})`;
    }
  }
  // If hsl format (e.g. the Coffee theme accent) → convert to hsla so the
  // opacity is actually applied rather than silently dropped by the fallback.
  if (color.startsWith('hsl(')) {
    const hslInnerValues = color.slice(4, -1).trim();
    return `hsla(${hslInnerValues}, ${opacity})`;
  }
  // If hex format
  if (color.startsWith('#')) {
    const hexColorString = color.replace('#', '');
    const redValue = parseInt(hexColorString.substring(0, 2), 16);
    const greenValue = parseInt(hexColorString.substring(2, 4), 16);
    const blueValue = parseInt(hexColorString.substring(4, 6), 16);
    return `rgba(${redValue}, ${greenValue}, ${blueValue}, ${opacity})`;
  }
  // Fallback
  return color;
}
