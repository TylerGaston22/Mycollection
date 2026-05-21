/**
 * Tiny "1 thing" vs "2 things" helper.
 * Defaults the plural form to `${singular}s` for the regular English case;
 * pass an explicit plural for irregulars ("child" / "children").
 */

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural ?? `${singular}s`;
}
