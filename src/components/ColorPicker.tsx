import { Label } from "./ui/label";
import { colorThemes, ThemeConfig } from "../utils/themeConfig";

const availableColorThemeOptions = Object.values(colorThemes);

interface ColorPickerProps {
  label: string;
  icon: any;
  type: 'movie' | 'tv-show' | 'restaurant' | 'place';
  selectedColor: string;
  onColorChange: (type: 'movie' | 'tv-show' | 'restaurant' | 'place', colorId: string) => void;
}

export function ColorPicker({ label, icon: Icon, type, selectedColor, onColorChange }: ColorPickerProps) {
  const matchingColorTheme = availableColorThemeOptions.find((colorTheme) => colorTheme.id === selectedColor);
  const selectedColorThemeName = matchingColorTheme?.name ?? 'Custom';

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <Label>{label}</Label>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {availableColorThemeOptions.map((colorTheme) => {
          let colorButtonClassName = 'h-16 rounded-lg transition-all hover:scale-105 relative overflow-hidden';
          if (selectedColor === colorTheme.id) {
            colorButtonClassName += ' ring-2 ring-orange-500 ring-offset-2 ring-offset-background';
          }
          return (
            <button
              key={colorTheme.id}
              onClick={() => onColorChange(type, colorTheme.id)}
              className={colorButtonClassName}
              title={colorTheme.name}
            >
              <div className="absolute inset-0 flex">
                <div className="w-1/2" style={{ background: colorTheme.sidebarGradient }} />
                <div className="w-1/2" style={{ background: colorTheme.backgroundGradient }} />
              </div>
              {selectedColor === colorTheme.id && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Selected: {selectedColorThemeName}</p>
    </div>
  );
}
